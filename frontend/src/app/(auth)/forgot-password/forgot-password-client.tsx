"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { postData } from "@/lib/fetch-util";
import { CoFlowLogo } from "@/components/logo";

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
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          margin: "0 auto",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "var(--shadow-card)",
          position: "relative",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
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
            margin: "0 auto 20px",
          }}
        >
          <CheckCircle2 size={28} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--foreground)", margin: "0 0 10px" }}>
          Lien de récupération envoyé
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: "0 auto 24px", maxWidth: 320, lineHeight: 1.6 }}>
          Si un compte est associé à <strong style={{ color: "var(--foreground)" }}>{submittedEmail}</strong>, vous recevrez un email contenant le lien de réinitialisation.
        </p>

        <Link
          href="/sign-in"
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 42,
            borderRadius: 10,
            fontSize: 13.5,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={15} />
          Retour à la page de connexion
        </Link>
      </div>
    );
  }

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

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <CoFlowLogo size={40} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--foreground)", margin: "0 0 6px" }}>
          Mot de passe oublié ?
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
          Saisissez votre email pour recevoir le lien de réinitialisation sécurisé.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
            Adresse email du compte
          </label>
          <div style={{ position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              type="email"
              placeholder="nom@entreprise.com"
              {...register("email")}
              style={{
                width: "100%",
                padding: "11px 14px 11px 40px",
                background: "var(--input-bg)",
                border: errors.email ? "1px solid #DC2626" : "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--foreground)",
                fontSize: 13.5,
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
          </div>
          {errors.email && (
            <p style={{ fontSize: 11.5, color: "#DC2626", marginTop: 5, margin: "5px 0 0", fontWeight: 500 }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 44,
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin-slow" />
              Envoi en cours...
            </>
          ) : (
            <>
              Envoyer le lien
              <ArrowRight size={16} className="lp-arrow" />
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: 22, textAlign: "center" }}>
        <Link
          href="/sign-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--muted-foreground)",
            textDecoration: "none",
            fontWeight: 600,
            transition: "color 0.15s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--foreground)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
        >
          <ArrowLeft size={14} />
          Retour à la page de connexion
        </Link>
      </div>

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
        <span>Lien chiffré à usage unique (15 min)</span>
      </div>
    </div>
  );
}
