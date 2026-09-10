"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Loader2, KeyRound } from "lucide-react";
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
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de l'envoi");
    },
  });

  if (sent) {
    return (
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.07)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "rgba(77, 153, 114, 0.12)",
            color: "#4D9972",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <CheckCircle2 size={28} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: "0 0 8px" }}>
          Lien de récupération envoyé
        </h2>
        <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 auto 24px", maxWidth: 320, lineHeight: 1.6 }}>
          Si un compte est associé à <strong style={{ color: "#1E293B" }}>{submittedEmail}</strong>, vous recevrez un email contenant les instructions.
        </p>

        <Link
          href="/sign-in"
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 42,
            borderRadius: 8,
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
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 16,
        padding: "36px 32px",
        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.07)",
        position: "relative",
      }}
    >
      {/* Top highlight line */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: "20%",
          right: "20%",
          height: 2,
          background: "linear-gradient(90deg, transparent, #4D9972, transparent)",
        }}
      />

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "rgba(77, 153, 114, 0.12)",
            color: "#4D9972",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <KeyRound size={20} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#1E293B", margin: "0 0 6px" }}>
          Récupérer mon mot de passe
        </h1>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
          Saisissez votre email pour recevoir les instructions de réinitialisation.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 7 }}>
            Adresse email
          </label>
          <div style={{ position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input
              type="email"
              placeholder="nom@entreprise.com"
              {...register("email")}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                background: "#F8FAFC",
                border: errors.email ? "1px solid #ef4444" : "1px solid #E2E8F0",
                borderRadius: 8,
                color: "#1E293B",
                fontSize: 13.5,
                outline: "none",
              }}
            />
          </div>
          {errors.email && (
            <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5, margin: "5px 0 0" }}>
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
            height: 42,
            borderRadius: 8,
            fontSize: 13.5,
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin-slow" />
              Envoi des instructions...
            </>
          ) : (
            <>
              Envoyer le lien
              <ArrowRight size={15} className="lp-arrow" />
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link
          href="/sign-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            color: "#64748B",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={13} />
          Retour à la page de connexion
        </Link>
      </div>
    </div>
  );
}
