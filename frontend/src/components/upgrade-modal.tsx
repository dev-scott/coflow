"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  X, Check, Zap, ArrowRight, ShieldCheck,
  CreditCard, Smartphone, Loader2, Sparkles
} from "lucide-react";
import { postData } from "@/lib/fetch-util";

interface UpgradeModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  userPlanStatus?: {
    plan?: string;
    planStatus?: string;
    isPro?: boolean;
    daysLeftInTrial?: number;
  };
}

export function UpgradeModal({ isOpen, open, onClose, userPlanStatus }: UpgradeModalProps) {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [currency, setCurrency] = useState<"XAF" | "EUR">("XAF");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "om" | "card">("momo");

  // Mutation pour activer l'essai gratuit 14 jours
  const { mutate: trialMutate, isPending: isTrialPending } = useMutation({
    mutationFn: () => postData<{ message: string; daysLeft: number }>("/payments/start-trial", {}),
    onSuccess: (data) => {
      toast.success(data.message || "Essai Pro de 14 jours activé !");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["plan-status"] });
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
        // En mode Sandbox / Test : confirmer automatiquement le paiement
        try {
          await postData("/payments/confirm-sandbox", { reference: data.reference });
          toast.success("Paiement validé avec succès ! Plan Pro activé.");
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          queryClient.invalidateQueries({ queryKey: ["plan-status"] });
          onClose();
        } catch {
          window.location.href = data.checkoutUrl;
        }
      } else if (data.checkoutUrl) {
        // Redirection vers la page de paiement sécurisée Notch Pay (MoMo / OM / Carte)
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 14, 23, 0.72)",
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
          maxWidth: 580,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "var(--shadow-lg)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fermer */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "none",
            border: "none",
            color: "var(--muted-foreground)",
            cursor: "pointer",
            padding: 6,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        {/* Liseré supérieur dégradé vert sauge */}
        <div
          style={{
            position: "absolute",
            top: -1,
            left: "20%",
            right: "20%",
            height: 2,
            background: "linear-gradient(90deg, transparent, #3B805C, transparent)",
          }}
        />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 999,
              background: "rgba(77, 153, 114, 0.12)",
              color: "#3B805C",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <Sparkles size={13} />
            CoFlow Pro
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--foreground)", margin: "0 0 6px" }}>
            Débloquez toute la puissance de CoFlow
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>
            Idéal pour les équipes, agences et freelances en croissance.
          </p>
        </div>

        {/* Atouts inclus */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            padding: "16px",
            borderRadius: 14,
            background: "var(--secondary)",
            border: "1px solid var(--border)",
            marginBottom: 24,
          }}
        >
          {[
            "Espaces de travail d'équipe illimités",
            "Collaborateurs & invités illimités",
            "Tableaux Kanban & Projets sans limite",
            "Suivi de progression en temps réel",
            "Archivage & historique complet",
            "Support prioritaire & assistance WhatsApp",
          ].map((perk, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "rgba(77, 153, 114, 0.16)",
                  color: "#3B805C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Check size={11} strokeWidth={3} />
              </div>
              <span>{perk}</span>
            </div>
          ))}
        </div>

        {/* ── Option A : Essai Gratuit 14 Jours ── */}
        {!userPlanStatus?.isPro && (
          <div
            style={{
              padding: "18px 20px",
              borderRadius: 16,
              border: "1.5px solid #3B805C",
              background: "rgba(77, 153, 114, 0.06)",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", margin: "0 0 2px" }}>
                Essai Gratuit de 14 jours
              </p>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: 0 }}>
                Testez toutes les fonctionnalités Pro sans payer maintenant. Aucune carte requise.
              </p>
            </div>

            <button
              onClick={() => trialMutate()}
              disabled={isTrialPending}
              className="lp-btn-primary"
              style={{
                height: 38,
                padding: "0 18px",
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: "nowrap",
                borderRadius: 8,
              }}
            >
              {isTrialPending ? (
                <>
                  <Loader2 size={14} className="animate-spin-slow" />
                  Activation...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Essayer 14 jours gratuit
                </>
              )}
            </button>
          </div>
        )}

        {/* Séparateur */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)", fontWeight: 700 }}>
            ou souscrire directement
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Période & Devise Selector */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
          {/* Mensuel / Annuel */}
          <div
            style={{
              display: "inline-flex",
              padding: 3,
              borderRadius: 8,
              background: "var(--secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: period === "monthly" ? "var(--card)" : "transparent",
                color: period === "monthly" ? "var(--foreground)" : "var(--muted-foreground)",
                boxShadow: period === "monthly" ? "var(--shadow-xs)" : "none",
              }}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setPeriod("yearly")}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: period === "yearly" ? "var(--card)" : "transparent",
                color: period === "yearly" ? "var(--foreground)" : "var(--muted-foreground)",
                boxShadow: period === "yearly" ? "var(--shadow-xs)" : "none",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>Annuel</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(77,153,114,0.14)", color: "#3B805C" }}>
                -20%
              </span>
            </button>
          </div>

          {/* Sélecteur FCFA / EUR */}
          <div
            style={{
              display: "inline-flex",
              padding: 3,
              borderRadius: 8,
              background: "var(--secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={() => setCurrency("XAF")}
              style={{
                padding: "6px 10px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: currency === "XAF" ? "var(--card)" : "transparent",
                color: currency === "XAF" ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              FCFA (Cameroun)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("EUR")}
              style={{
                padding: "6px 10px",
                fontSize: 11.5,
                fontWeight: 700,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: currency === "EUR" ? "var(--card)" : "transparent",
                color: currency === "EUR" ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              EUR (€ Europe)
            </button>
          </div>
        </div>

        {/* Moyens de paiement Cameroun & International */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
            Moyen de paiement adapté :
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              {
                id: "momo",
                label: "MTN MoMo",
                desc: "Mobile Money",
                icon: Smartphone,
                badge: "Cameroun",
                accent: "#FBBF24",
              },
              {
                id: "om",
                label: "Orange Money",
                desc: "OM Cameroun",
                icon: Smartphone,
                badge: "Cameroun",
                accent: "#F97316",
              },
              {
                id: "card",
                label: "Carte Bancaire",
                desc: "Visa / Mastercard",
                icon: CreditCard,
                badge: "International",
                accent: "#3B82F6",
              },
            ].map((method) => {
              const Icon = method.icon;
              const selected = paymentMethod === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  style={{
                    padding: "12px 10px",
                    borderRadius: 12,
                    border: selected ? "2px solid #3B805C" : "1px solid var(--border)",
                    background: selected ? "rgba(77, 153, 114, 0.08)" : "var(--secondary)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: method.accent }}>
                    <Icon size={18} />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", margin: "0 0 2px" }}>
                    {method.label}
                  </p>
                  <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                    {method.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bouton de paiement final avec prix affiché */}
        <button
          onClick={() => checkoutMutate()}
          disabled={isCheckoutPending}
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 48,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {isCheckoutPending ? (
            <>
              <Loader2 size={16} className="animate-spin-slow" />
              Génération du paiement sécurisé...
            </>
          ) : (
            <>
              S&apos;abonner à CoFlow Pro — {displayPrice} {periodLabel}
              <ArrowRight size={16} className="lp-arrow" />
            </>
          )}
        </button>

        {/* Réassurance & mentions légales */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontSize: 11,
            color: "var(--muted-foreground)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <ShieldCheck size={13} color="#3B805C" />
            Paiement chiffré & sécurisé
          </span>
          <span>•</span>
          <span>Annulable à tout moment</span>
        </div>
      </div>
    </div>
  );
}
