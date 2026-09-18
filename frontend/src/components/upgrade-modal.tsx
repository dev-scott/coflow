"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  X, Check, Zap, ShieldCheck,
  CreditCard, Smartphone, Loader2, Sparkles, Crown,
  Clock, AlertTriangle, ArrowRight
} from "lucide-react";
import { postData } from "@/lib/fetch-util";
import { usePlan } from "@/hooks/use-plan";

interface UpgradeModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  contextMessage?: string;
}

export function UpgradeModal({ isOpen, open, onClose, contextMessage }: UpgradeModalProps) {
  const queryClient = useQueryClient();
  const {
    isPro,
    isProPaid,
    isTrialActive,
    isTrialExpired,
    canStartTrial,
    daysLeftInTrial,
    currentTrialDay,
    trialProgressPercent,
    trialEndsAt,
    subscriptionEndsAt,
    paymentReference,
  } = usePlan();

  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [currency, setCurrency] = useState<"XAF" | "EUR">("XAF");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "om" | "card">("momo");

  // Invalidation globale pour mise à jour instantanée du profil et de l'interface
  const refreshUserData = () => {
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    queryClient.invalidateQueries({ queryKey: ["plan-status"] });
    queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  // Mutation pour activer l'essai gratuit 14 jours
  const { mutate: trialMutate, isPending: isTrialPending } = useMutation({
    mutationFn: () => postData<{ message: string; daysLeft: number }>("/payments/start-trial", {}),
    onSuccess: (data) => {
      toast.success(data.message || "Félicitations ! Votre essai Pro gratuit de 14 jours est activé.");
      refreshUserData();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Impossible d'activer l'essai gratuit");
    },
  });

  // Mutation pour initialiser le paiement (Notch Pay ou Sandbox)
  const { mutate: checkoutMutate, isPending: isCheckoutPending } = useMutation({
    mutationFn: () =>
      postData<{ checkoutUrl: string; reference: string; provider: string }>("/payments/checkout", {
        period,
        currency,
        paymentMethod,
      }),
    onSuccess: async (data) => {
      if (data.provider === "sandbox") {
        try {
          await postData("/payments/confirm-sandbox", { reference: data.reference });
          toast.success("🎉 Paiement validé avec succès ! Votre abonnement Pro est maintenant actif.");
          refreshUserData();
          onClose();
        } catch {
          window.location.href = data.checkoutUrl;
        }
      } else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de l'initialisation du paiement");
    },
  });

  const visible = isOpen ?? open ?? false;
  if (!visible) return null;

  const priceXaf = period === "yearly" ? "62 400" : "6 500";
  const priceEur = period === "yearly" ? "96" : "10";
  const displayPrice = currency === "XAF" ? `${priceXaf} FCFA` : `${priceEur} €`;
  const periodLabel = period === "yearly" ? "/ an" : "/ mois";
  const monthlyEquivalent = period === "yearly"
    ? (currency === "XAF" ? "soit 5 200 FCFA / mois" : "soit 8 € / mois")
    : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 15, 29, 0.78)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#FFFFFF",
          borderRadius: 20,
          border: "1px solid #E2E8F0",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3)",
          position: "relative",
          padding: "28px 28px 24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid #E2E8F0",
            background: "#F8FAFC",
            color: "#64748B",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#F1F5F9")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#F8FAFC")}
        >
          <X size={16} />
        </button>

        {/* Message de contexte optionnel (ex: limite de quota atteinte) */}
        {contextMessage && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(59, 128, 92, 0.08)",
              border: "1px solid rgba(59, 128, 92, 0.25)",
              color: "#2D6A4F",
              fontSize: 12.5,
              fontWeight: 600,
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Sparkles size={14} />
            <span>{contextMessage}</span>
          </div>
        )}

        {/* ── EN-TÊTE CONTEXTUEL SELON LE STATUT DE L'UTILISATEUR ── */}
        {isProPaid ? (
          /* Utilisateur Pro Payant Actif */
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(59, 128, 92, 0.12)",
                color: "#2D6A4F",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Crown size={26} strokeWidth={2.4} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>
              Votre Abonnement Pro est Actif
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
              Vous bénéficiez de toutes les fonctionnalités illimitées et du support prioritaire CoFlow.
            </p>
          </div>
        ) : isTrialActive ? (
          /* Utilisateur en Période d'Essai 14 Jours */
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(59, 128, 92, 0.12)",
                  color: "#2D6A4F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Zap size={22} fill="#3B805C" strokeWidth={2.2} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#2D6A4F",
                    background: "rgba(59, 128, 92, 0.10)",
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}
                >
                  ⭐ Période d'essai en cours
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", margin: "4px 0 0" }}>
                  Passez au Plan Pro définitif
                </h2>
              </div>
            </div>

            {/* Jauge visuelle de l'essai 14 jours */}
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "linear-gradient(135deg, rgba(59,128,92,0.06) 0%, rgba(37,99,235,0.04) 100%)",
                border: "1px solid rgba(59,128,92,0.22)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, fontSize: 12.5 }}>
                <span style={{ fontWeight: 600, color: "#0F172A" }}>
                  Jour {currentTrialDay} sur 14
                </span>
                <span style={{ fontWeight: 700, color: "#2D6A4F" }}>
                  {daysLeftInTrial} jour{daysLeftInTrial > 1 ? "s" : ""} restant{daysLeftInTrial > 1 ? "s" : ""}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 6,
                  borderRadius: 3,
                  background: "#E2E8F0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${trialProgressPercent}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #3B805C, #10B981)",
                    borderRadius: 3,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <p style={{ fontSize: 11.5, color: "#64748B", margin: "8px 0 0" }}>
                Vos fonctionnalités Pro sont déjà débloquées. Choisissez dès maintenant votre forfait pour continuer à collaborer sans coupure après votre période d'essai.
              </p>
            </div>
          </div>
        ) : isTrialExpired ? (
          /* Utilisateur avec Essai Expiré */
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <Clock size={22} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#92400E", margin: "0 0 2px" }}>
                  Votre période d'essai de 14 jours est terminée
                </h3>
                <p style={{ fontSize: 12, color: "#B45309", margin: 0 }}>
                  Tous vos projets et vos données sont conservés en toute sécurité. Choisissez votre formule ci-dessous pour débloquer immédiatement les membres illimités.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Utilisateur Starter Découverte */
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 20,
                background: "rgba(59, 128, 92, 0.10)",
                border: "1px solid rgba(59, 128, 92, 0.25)",
                color: "#2D6A4F",
                fontSize: 11.5,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              <Sparkles size={12} />
              <span>Passez à la vitesse supérieure</span>
            </div>
            <h2 style={{ fontSize: 23, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
              Débloquez tout le potentiel de CoFlow
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
              Collaborez sans aucune limite sur tous vos projets avec votre équipe.
            </p>
          </div>
        )}

        {/* ── OPTION ESSAI GRATUIT 14J (AFFICHÉ UNIQUEMENT SI ÉLIGIBLE, PAS EN ESSAI NI PRO) ── */}
        {canStartTrial && (
          <div
            style={{
              padding: "16px 18px",
              borderRadius: 14,
              border: "1.5px solid #3B805C",
              background: "linear-gradient(135deg, rgba(59,128,92,0.06) 0%, rgba(59,128,92,0.02) 100%)",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#FFFFFF", background: "#3B805C", padding: "1px 6px", borderRadius: 10 }}>
                  Recommandé
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>
                  Essai Gratuit de 14 jours
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
                Testez toutes les fonctionnalités Pro sans payer maintenant. 0 FCFA, sans carte requise.
              </p>
            </div>

            <button
              type="button"
              onClick={() => trialMutate()}
              disabled={isTrialPending}
              style={{
                height: 38,
                padding: "0 16px",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#FFFFFF",
                background: "#2D6A4F",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
                transition: "background 0.15s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#24553F")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#2D6A4F")}
            >
              {isTrialPending ? (
                <>
                  <Loader2 size={13} className="animate-spin-slow" />
                  Activation...
                </>
              ) : (
                <>
                  <Zap size={13} fill="#FFFFFF" />
                  Essayer 14 jours gratuit
                </>
              )}
            </button>
          </div>
        )}

        {/* ── DÉTAILS DE L'ABONNEMENT ACTIF (SI DÉJÀ PRO PAYANT) ── */}
        {isProPaid ? (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                padding: "16px 18px",
                borderRadius: 14,
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748B" }}>Statut</span>
                <span style={{ color: "#2D6A4F", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <Check size={14} strokeWidth={3} /> Actif
                </span>
              </div>
              {subscriptionEndsAt && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#64748B" }}>Prochaine échéance</span>
                  <span style={{ color: "#0F172A", fontWeight: 600 }}>
                    {new Date(subscriptionEndsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              )}
              {paymentReference && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Référence de paiement</span>
                  <span style={{ color: "#475569", fontFamily: "monospace", fontSize: 11.5 }}>
                    {paymentReference}
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 18, textAlign: "center" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  height: 42,
                  borderRadius: 10,
                  background: "#2D6A4F",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          /* ── FORMULAIRE DE SOUSCRIPTION & PAIEMENT PRO ── */
          <>
            {canStartTrial && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 16px" }}>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontWeight: 700 }}>
                  ou souscrire directement
                </span>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              </div>
            )}

            {/* Sélecteurs Période (Mensuel / Annuel) & Devise */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
              {/* Mensuel / Annuel Toggle */}
              <div
                style={{
                  display: "inline-flex",
                  padding: 3,
                  borderRadius: 10,
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPeriod("monthly")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background: period === "monthly" ? "#FFFFFF" : "transparent",
                    color: period === "monthly" ? "#0F172A" : "#64748B",
                    boxShadow: period === "monthly" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.12s ease",
                  }}
                >
                  Mensuel
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod("yearly")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background: period === "yearly" ? "#FFFFFF" : "transparent",
                    color: period === "yearly" ? "#2D6A4F" : "#64748B",
                    boxShadow: period === "yearly" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.12s ease",
                  }}
                >
                  <span>Annuel</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#2D6A4F", background: "rgba(59,128,92,0.15)", padding: "1px 5px", borderRadius: 6 }}>
                    -20%
                  </span>
                </button>
              </div>

              {/* Devise Toggle */}
              <div
                style={{
                  display: "inline-flex",
                  padding: 3,
                  borderRadius: 10,
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setCurrency("XAF")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background: currency === "XAF" ? "#FFFFFF" : "transparent",
                    color: currency === "XAF" ? "#0F172A" : "#64748B",
                    boxShadow: currency === "XAF" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  FCFA (Cameroun)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("EUR")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background: currency === "EUR" ? "#FFFFFF" : "transparent",
                    color: currency === "EUR" ? "#0F172A" : "#64748B",
                    boxShadow: currency === "EUR" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  EUR (€)
                </button>
              </div>
            </div>

            {/* Carte de Tarification Affichée */}
            <div
              style={{
                padding: "16px 20px",
                borderRadius: 14,
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B" }}>
                  Formule Sélectionnée
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>
                    {displayPrice}
                  </span>
                  <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                    {periodLabel}
                  </span>
                </div>
                {monthlyEquivalent && (
                  <span style={{ fontSize: 11.5, color: "#2D6A4F", fontWeight: 600 }}>
                    {monthlyEquivalent} · 2 mois gratuits offerts !
                  </span>
                )}
              </div>

              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(59, 128, 92, 0.10)",
                  border: "1px solid rgba(59, 128, 92, 0.25)",
                  color: "#2D6A4F",
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: "right",
                }}
              >
                Plan Pro
              </div>
            </div>

            {/* Choix du Moyen de Paiement */}
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", display: "block", marginBottom: 8 }}>
                Moyen de Paiement Sécurisé
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {/* MTN Mobile Money */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("momo")}
                  style={{
                    padding: "12px 10px",
                    borderRadius: 12,
                    border: paymentMethod === "momo" ? "2px solid #2D6A4F" : "1px solid #E2E8F0",
                    background: paymentMethod === "momo" ? "rgba(59, 128, 92, 0.05)" : "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.12s ease",
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "#FFCC00", color: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, marginBottom: 4 }}>
                    MTN
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#0F172A" }}>MTN MoMo</div>
                  <div style={{ fontSize: 9.5, color: "#64748B" }}>Cameroun & CEMAC</div>
                </button>

                {/* Orange Money */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("om")}
                  style={{
                    padding: "12px 10px",
                    borderRadius: 12,
                    border: paymentMethod === "om" ? "2px solid #2D6A4F" : "1px solid #E2E8F0",
                    background: paymentMethod === "om" ? "rgba(59, 128, 92, 0.05)" : "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.12s ease",
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "#FF6600", color: "#FFF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, marginBottom: 4 }}>
                    OM
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#0F172A" }}>Orange Money</div>
                  <div style={{ fontSize: 9.5, color: "#64748B" }}>Cameroun & CEMAC</div>
                </button>

                {/* Carte Bancaire */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  style={{
                    padding: "12px 10px",
                    borderRadius: 12,
                    border: paymentMethod === "card" ? "2px solid #2D6A4F" : "1px solid #E2E8F0",
                    background: paymentMethod === "card" ? "rgba(59, 128, 92, 0.05)" : "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.12s ease",
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "#2563EB", color: "#FFF", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                    <CreditCard size={15} />
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#0F172A" }}>Carte Bancaire</div>
                  <div style={{ fontSize: 9.5, color: "#64748B" }}>Visa / Mastercard</div>
                </button>
              </div>
            </div>

            {/* Avantages Inclus */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 12px",
                padding: "12px 14px",
                borderRadius: 10,
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                marginBottom: 20,
              }}
            >
              {[
                "Espaces de travail illimités",
                "Membres d'équipe illimités",
                "Projets & Tâches sans limite",
                "Support prioritaire dédié",
              ].map((perk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#334155", fontWeight: 500 }}>
                  <div style={{ width: 15, height: 15, borderRadius: "50%", background: "rgba(59,128,92,0.15)", color: "#2D6A4F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            {/* Bouton de Validation du Paiement */}
            <button
              type="button"
              onClick={() => checkoutMutate()}
              disabled={isCheckoutPending}
              style={{
                width: "100%",
                height: 46,
                borderRadius: 10,
                background: "#2D6A4F",
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s ease",
                boxShadow: "0 4px 14px rgba(45, 106, 79, 0.25)",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#24553F")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#2D6A4F")}
            >
              {isCheckoutPending ? (
                <>
                  <Loader2 size={16} className="animate-spin-slow" />
                  Initialisation du paiement sécurisé...
                </>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  Confirmer et payer {displayPrice} {periodLabel}
                </>
              )}
            </button>

            {/* Badge de réassurance */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, fontSize: 11, color: "#94A3B8" }}>
              <ShieldCheck size={13} color="#64748B" />
              <span>Paiement 100% sécurisé via Notch Pay · Sandbox instantanée en local</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
