import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/User.model.js";
import Subscription from "../models/Subscription.model.js";
import { getFrontendBaseUrl } from "../lib/urls.js";

const NOTCHPAY_PUBLIC_KEY = process.env.NOTCHPAY_PUBLIC_KEY;
const NOTCHPAY_HASH_KEY = process.env.NOTCHPAY_HASH_KEY;

// Tarifs officiels CoFlow (XAF pour le Cameroun, EUR pour l'international)
const PRICING = {
  monthly: { XAF: 6500, EUR: 10 },
  yearly: { XAF: 62400, EUR: 96 }, // ~20% d'économie
};

/**
 * Démarre l'essai gratuit de 14 jours au Plan Pro (0€, sans carte bancaire)
 */
export const startFreeTrial = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ message: "Utilisateur introuvable" });
    return;
  }

  // Si l'utilisateur est déjà Pro actif
  if (user.plan === "pro" && user.planStatus === "active") {
    res.status(400).json({ message: "Vous êtes déjà abonné au plan Pro." });
    return;
  }

  // Si l'utilisateur a déjà consommé son essai gratuit
  if (user.planStatus === "trialing" && user.trialEndsAt && user.trialEndsAt < new Date()) {
    res.status(400).json({
      message: "Votre période d'essai gratuit de 14 jours est terminée. Veuillez souscrire pour continuer à profiter du plan Pro.",
      trialExpired: true,
    });
    return;
  }

  // Activer l'essai gratuit 14 jours
  const trialDays = 14;
  const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

  user.plan = "pro";
  user.planStatus = "trialing";
  user.trialEndsAt = trialEndsAt;
  await user.save();

  res.status(200).json({
    message: "Félicitations ! Votre essai Pro gratuit de 14 jours est maintenant actif.",
    plan: user.plan,
    planStatus: user.planStatus,
    trialEndsAt: user.trialEndsAt,
    daysLeft: trialDays,
  });
};

/**
 * Récupère le statut actuel du plan de l'utilisateur (Starter, Pro, Essai)
 */
export const getPlanStatus = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ message: "Utilisateur introuvable" });
    return;
  }

  const now = new Date();
  let isPro = false;
  let daysLeftInTrial = 0;

  if (user.plan === "pro" || user.plan === "enterprise") {
    if (user.planStatus === "active") {
      isPro = true;
    } else if (user.planStatus === "trialing" && user.trialEndsAt && user.trialEndsAt > now) {
      isPro = true;
      const diffTime = user.trialEndsAt.getTime() - now.getTime();
      daysLeftInTrial = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  res.status(200).json({
    plan: user.plan,
    planStatus: user.planStatus,
    isPro,
    trialEndsAt: user.trialEndsAt,
    daysLeftInTrial,
    subscriptionEndsAt: user.subscriptionEndsAt,
  });
};

/**
 * Initialise un paiement sécurisé (MoMo, OM ou Carte) via Notch Pay ou Sandbox
 */
export const createCheckout = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ message: "Utilisateur introuvable" });
    return;
  }

  const {
    period = "monthly",
    currency = "XAF",
    paymentMethod = "momo",
  } = req.body as {
    period?: "monthly" | "yearly";
    currency?: "XAF" | "EUR";
    paymentMethod?: "momo" | "om" | "card";
  };

  const selectedPeriod = period === "yearly" ? "yearly" : "monthly";
  const selectedCurrency = currency === "EUR" ? "EUR" : "XAF";
  const amount = PRICING[selectedPeriod][selectedCurrency];

  const reference = `COFLOW_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Enregistrer la tentative de souscription
  const subscription = await Subscription.create({
    user: user._id,
    amount,
    currency: selectedCurrency,
    provider: NOTCHPAY_PUBLIC_KEY ? "notchpay" : "sandbox",
    reference,
    status: "pending",
    paymentMethod,
    plan: "pro",
    period: selectedPeriod,
    metadata: {
      userEmail: user.email,
      userName: user.name,
    },
  });

  // 1. Si une clé Notch Pay est renseignée, appeler l'API officielle Notch Pay
  if (NOTCHPAY_PUBLIC_KEY) {
    try {
      const response = await fetch("https://api.notchpay.co/payments/initialize", {
        method: "POST",
        headers: {
          "Authorization": NOTCHPAY_PUBLIC_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: selectedCurrency,
          description: `Abonnement CoFlow Pro (${selectedPeriod === "yearly" ? "Annuel" : "Mensuel"})`,
          email: user.email,
          name: user.name,
          reference,
          callback: `${getFrontendBaseUrl(req)}/dashboard?payment=success&ref=${reference}`,
        }),
      });

      const notchData = (await response.json()) as any;

      if (notchData && notchData.authorization_url) {
        subscription.externalReference = notchData.transaction?.reference;
        await subscription.save();

        res.status(200).json({
          checkoutUrl: notchData.authorization_url,
          reference,
          provider: "notchpay",
        });
        return;
      }
    } catch (err) {
      console.error("[NotchPay Init Error]", err);
    }
  }

  // 2. Mode Sandbox / Dev (sans clé Notch Pay requise) : permet de tester immédiatement
  console.log("\n" + "=".repeat(70));
  console.log("💳  [PAYMENT CHECKOUT INITIALIZED]");
  console.log(`    Client     : ${user.name} (${user.email})`);
  console.log(`    Montant    : ${amount.toLocaleString()} ${selectedCurrency}`);
  console.log(`    Mode       : ${paymentMethod.toUpperCase()} (Cameroun / International)`);
  console.log(`    Référence  : ${reference}`);
  console.log("=".repeat(70) + "\n");

  res.status(200).json({
    checkoutUrl: `${getFrontendBaseUrl(req)}/dashboard?payment=sandbox&ref=${reference}`,
    reference,
    amount,
    currency: selectedCurrency,
    provider: "sandbox",
  });
};

/**
 * Confirme et active l'abonnement en mode Sandbox (pour les tests immédiats en dev)
 */
export const confirmSandboxPayment = async (req: Request, res: Response): Promise<void> => {
  const { reference } = req.body as { reference: string };

  const subscription = await Subscription.findOne({ reference });
  if (!subscription) {
    res.status(404).json({ message: "Transaction introuvable" });
    return;
  }

  subscription.status = "completed";
  await subscription.save();

  const user = await User.findById(subscription.user);
  if (user) {
    const days = subscription.period === "yearly" ? 365 : 30;
    user.plan = "pro";
    user.planStatus = "active";
    user.subscriptionEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    user.paymentReference = reference;
    await user.save();
  }

  res.status(200).json({
    message: "Paiement validé avec succès ! Votre plan Pro est activé.",
    plan: "pro",
    status: "active",
  });
};

/**
 * Webhook sécurisé Notch Pay pour recevoir la confirmation de paiement
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = req.body;

    // Si une clé secrète de hachage est configurée, vérifier la signature
    if (NOTCHPAY_HASH_KEY) {
      const signature = req.headers["x-notch-signature"] as string;
      const expectedSignature = crypto
        .createHmac("sha256", NOTCHPAY_HASH_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (signature !== expectedSignature) {
        res.status(400).json({ message: "Invalid signature" });
        return;
      }
    }

    const reference = event.data?.reference || event.reference;
    const eventType = event.event;

    if (eventType === "payment.complete" && reference) {
      const subscription = await Subscription.findOne({ reference });
      if (subscription) {
        subscription.status = "completed";
        await subscription.save();

        const user = await User.findById(subscription.user);
        if (user) {
          const days = subscription.period === "yearly" ? 365 : 30;
          user.plan = "pro";
          user.planStatus = "active";
          user.subscriptionEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
          user.paymentReference = reference;
          await user.save();
          console.log(`[Subscription Activated] User ${user.email} upgraded to Pro Plan.`);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Payment Webhook Error]", error);
    res.status(500).json({ message: "Webhook processing error" });
  }
};
