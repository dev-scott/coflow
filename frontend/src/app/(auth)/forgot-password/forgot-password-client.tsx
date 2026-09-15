"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2, ShieldCheck, KeyRound, AlertCircle } from "lucide-react";
import { postData } from "@/lib/fetch-util";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordClient() {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      postData<{ message: string }>("/auth/reset-password-request", data),
    onSuccess: (_, variables) => {
      setSubmittedEmail(variables.email);
      setSent(true);
      toast.success("Instructions envoyées !");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de l'envoi");
    },
  });

  if (sent) {
    return (
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-card-accent-line" />

        <div className="auth-icon-circle success">
          <CheckCircle2 size={28} />
        </div>
        <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 10px" }}>
          Lien de récupération envoyé
        </h2>
        <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 auto 20px", maxWidth: 330, lineHeight: 1.6 }}>
          Si un compte est associé à <strong style={{ color: "#0F172A", fontWeight: 700 }}>{submittedEmail}</strong>, vous recevrez un email contenant le lien de réinitialisation.
        </p>

        <div
          style={{
            padding: "12px 14px",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 10,
            marginBottom: 24,
            fontSize: 12,
            color: "#64748B",
            lineHeight: 1.5,
            textAlign: "left",
          }}
        >
          💡 Le lien est valable pendant 15 minutes. N&apos;oubliez pas de vérifier vos courriers indésirables si vous ne trouvez pas l&apos;email.
        </div>

        <Link
          href="/sign-in"
          className="auth-back-link"
          style={{ justifyContent: "center" }}
        >
          <ArrowLeft size={14} />
          Retour à la page de connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-card-accent-line" />

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="auth-icon-circle success">
          <KeyRound size={24} />
        </div>
        <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 6px" }}>
          Mot de passe oublié ?
        </h1>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
          Saisissez votre adresse email pour recevoir un lien de réinitialisation sécurisé.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="auth-input-group">
          <label className="auth-input-label">
            <span>Adresse email du compte</span>
          </label>
          <div className="auth-input-wrapper">
            <Mail className="auth-input-icon" size={16} />
            <input
              type="email"
              placeholder="nom@entreprise.com"
              {...register("email")}
              className={`auth-input-field ${errors.email ? "error" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="auth-field-error">
              <AlertCircle size={12} />
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="auth-submit-btn"
          style={{ marginTop: 4 }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              Envoyer le lien de réinitialisation
              <ArrowRight size={16} className="arrow-icon" />
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: 22, textAlign: "center" }}>
        <Link
          href="/sign-in"
          className="auth-back-link"
          style={{ justifyContent: "center" }}
        >
          <ArrowLeft size={14} />
          Retour à la page de connexion
        </Link>
      </div>

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
        <span>Lien chiffré à usage unique (15 min)</span>
      </div>
    </div>
  );
}

