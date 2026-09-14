"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail,
  Send, ShieldCheck, ArrowLeft
} from "lucide-react";
import { postData } from "@/lib/fetch-util";
import type { AuthResponse } from "@/types";

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
    <div className="auth-card" style={{ textAlign: "center" }}>
      <div className="auth-card-accent-line" />

      {/* ── Cas 1: Validation en cours ── */}
      {isPending && (
        <div>
          <div className="auth-icon-circle neutral">
            <Loader2 size={26} color="#3B805C" className="animate-spin" />
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 8px" }}>
            Activation en cours...
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
            Veuillez patienter quelques instants pendant la vérification de votre compte.
          </p>
        </div>
      )}

      {/* ── Cas 2: Validation réussie ── */}
      {isSuccess && (
        <div>
          <div className="auth-icon-circle success">
            <CheckCircle2 size={30} />
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 8px" }}>
            Compte activé avec succès !
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 0 24px", lineHeight: 1.5 }}>
            Votre adresse email a été confirmée. Vous pouvez dès maintenant explorer vos projets et inviter votre équipe.
          </p>
          <Link
            href="/dashboard"
            className="auth-submit-btn"
            style={{ textDecoration: "none" }}
          >
            Accéder à mon espace de travail
            <ArrowRight size={16} className="arrow-icon" />
          </Link>
        </div>
      )}

      {/* ── Cas 3: Erreur ou jeton invalide ── */}
      {isError && (
        <div>
          <div className="auth-icon-circle error">
            <AlertCircle size={28} />
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 8px" }}>
            Lien expiré ou invalide
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px", lineHeight: 1.5 }}>
            Ce lien de vérification ne fonctionne plus ou a déjà été utilisé. Entrez votre adresse pour en recevoir un nouveau :
          </p>

          <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={16} />
              <input
                type="email"
                placeholder="votre-email@entreprise.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                className="auth-input-field"
              />
            </div>

            <button
              type="submit"
              disabled={isResending}
              className="auth-submit-btn"
            >
              {isResending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Renvoyer un nouveau lien
                  <Send size={14} className="arrow-icon" />
                </>
              )}
            </button>
          </form>

          <Link href="/sign-in" className="auth-back-link" style={{ justifyContent: "center" }}>
            <ArrowLeft size={14} />
            Retour à la page de connexion
          </Link>
        </div>
      )}

      {/* ── Cas 4: Aucun jeton fourni ── */}
      {!token && !isPending && !isSuccess && !isError && (
        <div>
          <div className="auth-icon-circle success">
            <Mail size={26} />
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 8px" }}>
            Activation de votre compte
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 20px", lineHeight: 1.5 }}>
            Saisissez votre adresse email pour recevoir un nouveau lien d&apos;activation :
          </p>

          {resendSent ? (
            <div className="auth-alert-success">
              <p style={{ fontSize: 13.5, color: "#0F172A", margin: "0 0 6px", fontWeight: 700 }}>
                Email de confirmation envoyé !
              </p>
              <p style={{ fontSize: 12.5, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                Consultez votre boîte mail et cliquez sur le lien pour activer définitivement votre compte.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={16} />
                <input
                  type="email"
                  placeholder="votre-email@entreprise.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  className="auth-input-field"
                />
              </div>

              <button
                type="submit"
                disabled={isResending}
                className="auth-submit-btn"
              >
                {isResending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer le lien d&apos;activation
                    <Send size={14} className="arrow-icon" />
                  </>
                )}
              </button>
            </form>
          )}

          <Link href="/sign-in" className="auth-back-link" style={{ justifyContent: "center" }}>
            <ArrowLeft size={14} />
            Retour à la page de connexion
          </Link>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid rgba(15, 23, 42, 0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontSize: 11.5,
          color: "#64748B",
        }}
      >
        <ShieldCheck size={14} color="#3B805C" />
        <span>Vérification sécurisée & chiffrée SSL</span>
      </div>
    </div>
  );
}

