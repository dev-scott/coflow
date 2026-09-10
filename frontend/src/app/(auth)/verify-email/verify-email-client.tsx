"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail,
  Send, ShieldCheck
} from "lucide-react";
import { postData } from "@/lib/fetch-util";
import type { AuthResponse } from "@/types";
import { CoFlowLogo } from "@/components/logo";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [resendEmail, setResendEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);

  // Mutation de vérification du token
  const { mutate: verifyMutate, isPending, isSuccess, isError, error, data } = useMutation({
    mutationFn: (tok: string) => postData<AuthResponse>("/auth/verify-email", { token: tok }),
    onSuccess: async (res) => {
      if (typeof window !== "undefined" && res.token) {
        localStorage.setItem("coflow_token", res.token);
        document.cookie = `coflow_token=${encodeURIComponent(res.token)}; path=/; max-age=604800; SameSite=Lax`;
      }
      try {
        if (res.token) {
          await fetch("/api/auth/set-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: res.token }),
          });
        }
      } catch (e) {
        console.error("set-token error:", e);
      }
      toast.success("Votre compte est maintenant vérifié !");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Impossible de vérifier l'email");
    },
  });

  // Déclenchement automatique de la validation si un jeton est présent dans l'URL
  useEffect(() => {
    if (token) {
      verifyMutate(token);
    }
  }, [token, verifyMutate]);

  // Mutation pour réexpédier un email
  const { mutate: resendMutate, isPending: isResending } = useMutation({
    mutationFn: (email: string) => postData<{ message: string }>("/auth/resend-verification", { email }),
    onSuccess: () => {
      setResendSent(true);
      toast.success("Un nouvel email de confirmation a été envoyé !");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de l'envoi");
    },
  });

  const handleResend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    resendMutate(resendEmail);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "36px 32px",
        boxShadow: "var(--shadow-card)",
        textAlign: "center",
        position: "relative",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Top green accent line */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: "25%",
          right: "25%",
          height: 2,
          background: "linear-gradient(90deg, transparent, #3B805C, transparent)",
        }}
      />

      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <CoFlowLogo size={40} />
      </div>

      {/* ── Cas 1: Validation en cours ── */}
      {isPending && (
        <div>
          <div style={{ margin: "20px auto" }}>
            <Loader2 size={36} color="#3B805C" className="animate-spin-slow" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)", margin: "0 0 8px" }}>
            Validation de votre email...
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
            Veuillez patienter quelques instants pendant l&apos;activation de votre compte.
          </p>
        </div>
      )}

      {/* ── Cas 2: Validation réussie ── */}
      {isSuccess && (
        <div>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "rgba(77, 153, 114, 0.12)",
              color: "#3B805C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "12px auto 20px",
            }}
          >
            <CheckCircle2 size={30} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--foreground)", margin: "0 0 8px" }}>
            Compte activé !
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: "0 0 24px", lineHeight: 1.5 }}>
            Votre adresse email a été confirmée avec succès. Vous pouvez dès maintenant explorer vos projets.
          </p>
          <Link
            href="/dashboard"
            className="lp-btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              height: 44,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Ouvrir mon espace de travail
            <ArrowRight size={16} className="lp-arrow" />
          </Link>
        </div>
      )}

      {/* ── Cas 3: Erreur ou jeton invalide ── */}
      {isError && (
        <div>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(220, 38, 38, 0.12)",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "12px auto 16px",
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)", margin: "0 0 8px" }}>
            Lien expiré ou invalide
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 22px", lineHeight: 1.5 }}>
            Ce lien de vérification ne fonctionne plus ou a déjà été utilisé. Saisissez votre adresse pour en recevoir un nouveau :
          </p>

          <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
              <input
                type="email"
                placeholder="votre-email@entreprise.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 40px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--foreground)",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isResending}
              className="lp-btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                height: 42,
                borderRadius: 10,
                fontSize: 13.5,
              }}
            >
              {isResending ? (
                <Loader2 size={16} className="animate-spin-slow" />
              ) : (
                <>
                  <Send size={14} />
                  Renvoyer un nouveau lien
                </>
              )}
            </button>
          </form>

          <Link href="/sign-in" style={{ fontSize: 12.5, color: "#3B805C", fontWeight: 700, textDecoration: "none" }}>
            Retour à la page de connexion
          </Link>
        </div>
      )}

      {/* ── Cas 4: Aucun jeton fourni ── */}
      {!token && !isPending && !isSuccess && !isError && (
        <div>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(77, 153, 114, 0.12)",
              color: "#3B805C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "12px auto 16px",
            }}
          >
            <Mail size={26} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)", margin: "0 0 8px" }}>
            Vérification de compte
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 20px", lineHeight: 1.5 }}>
            Saisissez votre adresse email pour recevoir un nouveau lien d&apos;activation :
          </p>

          {resendSent ? (
            <div
              style={{
                padding: "16px",
                borderRadius: 10,
                background: "rgba(77, 153, 114, 0.10)",
                border: "1px solid rgba(77, 153, 114, 0.25)",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--foreground)", margin: "0 0 10px", fontWeight: 600 }}>
                Email envoyé !
              </p>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: 0 }}>
                Consultez votre boîte mail et cliquez sur le lien reçu pour activer votre compte.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                <input
                  type="email"
                  placeholder="votre-email@entreprise.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 40px",
                    background: "var(--input-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    color: "var(--foreground)",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isResending}
                className="lp-btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  height: 42,
                  borderRadius: 10,
                  fontSize: 13.5,
                }}
              >
                {isResending ? (
                  <Loader2 size={16} className="animate-spin-slow" />
                ) : (
                  <>
                    <Send size={14} />
                    Envoyer le lien
                  </>
                )}
              </button>
            </form>
          )}

          <Link href="/sign-in" style={{ fontSize: 12.5, color: "#3B805C", fontWeight: 700, textDecoration: "none" }}>
            Retour à la connexion
          </Link>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 16,
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 11.5,
          color: "var(--muted-foreground)",
        }}
      >
        <ShieldCheck size={13} color="#3B805C" />
        <span>Sécurité & conformité RGPD</span>
      </div>
    </div>
  );
}
