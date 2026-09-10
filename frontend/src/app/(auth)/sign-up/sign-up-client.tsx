"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  CheckCircle2, ShieldCheck, MailCheck, Send, ArrowLeft
} from "lucide-react";
import { postData } from "@/lib/fetch-util";
import { CoFlowLogo } from "@/components/logo";

const schema = z
  .object({
    name: z.string().min(2, "Au moins 2 caractères requis"),
    email: z.string().email("Adresse email invalide"),
    password: z.string().min(8, "Au moins 8 caractères requis"),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Faible", color: "#EF4444" },
    { label: "Moyen", color: "#F59E0B" },
    { label: "Bon", color: "#3B805C" },
    { label: "Robuste", color: "#3B805C" },
  ];
  const level = levels[Math.min(score - 1, 3)] ?? { label: "Faible", color: "#EF4444" };
  const filledBars = Math.max(score, 1);

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, height: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: 2,
              background: i <= filledBars ? level.color : "var(--border)",
              transition: "background 0.25s ease",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: level.color, fontWeight: 700 }}>
          Force : {level.label}
        </span>
        <span style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>
          8+ car., chiffres & majuscules
        </span>
      </div>
    </div>
  );
}

export default function SignUpClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const passwordVal = watch("password") || "";

  const { mutate: registerMutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      postData<{ message: string; requireVerification?: boolean }>("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    onSuccess: (_, variables) => {
      setRegisteredEmail(variables.email);
      toast.success("Compte créé ! Veuillez vérifier vos emails.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Impossible de créer le compte");
    },
  });

  const { mutate: resendMutate, isPending: isResending } = useMutation({
    mutationFn: (email: string) => postData<{ message: string }>("/auth/resend-verification", { email }),
    onSuccess: (data) => {
      toast.success(data.message || "Email de vérification renvoyé !");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Impossible de renvoyer l'email");
    },
  });

  // ── Écran de confirmation d'envoi d'email ──
  if (registeredEmail) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          margin: "0 auto",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "40px 32px",
          boxShadow: "var(--shadow-card)",
          textAlign: "center",
          position: "relative",
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(77, 153, 114, 0.12)",
            color: "#3B805C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <MailCheck size={28} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--foreground)", margin: "0 0 10px" }}>
          Vérifiez votre boîte mail
        </h1>

        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: "0 0 20px", lineHeight: 1.6 }}>
          Un lien d&apos;activation vient d&apos;être envoyé à :<br />
          <strong style={{ color: "var(--foreground)" }}>{registeredEmail}</strong>
        </p>

        <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 24px", lineHeight: 1.5 }}>
          Cliquez sur le lien reçu pour activer votre compte. Pensez également à vérifier vos courriers indésirables (spams).
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            type="button"
            onClick={() => resendMutate(registeredEmail)}
            disabled={isResending}
            style={{
              width: "100%",
              height: 42,
              borderRadius: 10,
              background: "var(--secondary)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              cursor: isResending ? "not-allowed" : "pointer",
            }}
          >
            {isResending ? (
              <Loader2 size={14} className="animate-spin-slow" />
            ) : (
              <Send size={14} color="#3B805C" />
            )}
            {isResending ? "Envoi en cours..." : "Renvoyer l'email de confirmation"}
          </button>

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
      </div>
    );
  }

  // ── Formulaire d'inscription épuré ──
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 460,
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

      {/* Header: Logo & Segmented Tab */}
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <CoFlowLogo size={40} />
        </div>

        {/* Dual Tab: Connexion / Inscription */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
            padding: 4,
            background: "var(--secondary)",
            borderRadius: 10,
            border: "1px solid var(--border)",
            marginBottom: 20,
          }}
        >
          <Link
            href="/sign-in"
            style={{
              padding: "8px 0",
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--muted-foreground)",
              borderRadius: 7,
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
          >
            Connexion
          </Link>
          <div
            style={{
              padding: "8px 0",
              textAlign: "center",
              fontSize: 13,
              fontWeight: 700,
              background: "var(--card)",
              color: "var(--foreground)",
              borderRadius: 7,
              boxShadow: "var(--shadow-xs)",
              cursor: "default",
            }}
          >
            Inscription
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--foreground)", margin: "0 0 6px" }}>
          Rejoindre CoFlow
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
          Créez votre premier espace de travail d&apos;équipe.
        </p>
      </div>

      {/* Formulaire épuré */}
      <form onSubmit={handleSubmit((d) => registerMutate(d))} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {/* Nom complet */}
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
            Nom complet
          </label>
          <div style={{ position: "relative" }}>
            <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Alexandre Martin"
              {...register("name")}
              style={{
                width: "100%",
                padding: "11px 14px 11px 40px",
                background: "var(--input-bg)",
                border: errors.name ? "1px solid #DC2626" : "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--foreground)",
                fontSize: 13.5,
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
          </div>
          {errors.name && (
            <p style={{ fontSize: 11.5, color: "#DC2626", marginTop: 5, margin: "5px 0 0", fontWeight: 500 }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
            Adresse email professionnelle
          </label>
          <div style={{ position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              type="email"
              placeholder="alexandre@entreprise.com"
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

        {/* Mot de passe */}
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
            Mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="8 caractères minimum"
              {...register("password")}
              style={{
                width: "100%",
                padding: "11px 40px 11px 40px",
                background: "var(--input-bg)",
                border: errors.password ? "1px solid #DC2626" : "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--foreground)",
                fontSize: 13.5,
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                padding: 4,
                cursor: "pointer",
                color: "var(--muted-foreground)",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Afficher ou masquer le mot de passe"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <StrengthBar password={passwordVal} />
          {errors.password && (
            <p style={{ fontSize: 11.5, color: "#DC2626", marginTop: 5, margin: "5px 0 0", fontWeight: 500 }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirmer le mot de passe */}
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
            Confirmer le mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Répétez votre mot de passe"
              {...register("confirmPassword")}
              style={{
                width: "100%",
                padding: "11px 40px 11px 40px",
                background: "var(--input-bg)",
                border: errors.confirmPassword ? "1px solid #DC2626" : "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--foreground)",
                fontSize: 13.5,
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                padding: 4,
                cursor: "pointer",
                color: "var(--muted-foreground)",
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Afficher ou masquer la confirmation du mot de passe"
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p style={{ fontSize: 11.5, color: "#DC2626", marginTop: 5, margin: "5px 0 0", fontWeight: 500 }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Bouton d'inscription */}
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
            marginTop: 6,
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin-slow" />
              Création en cours...
            </>
          ) : (
            <>
              Créer mon compte
              <ArrowRight size={16} className="lp-arrow" />
            </>
          )}
        </button>
      </form>

      {/* Trust footer */}
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
        <span>Données protégées & conformes RGPD</span>
      </div>
    </div>
  );
}
