"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  ShieldCheck, MailCheck, Send, ArrowLeft, Zap, AlertCircle
} from "lucide-react";
import { postData } from "@/lib/fetch-util";

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
              background: i <= filledBars ? level.color : "rgba(15, 23, 42, 0.08)",
              transition: "background 0.25s ease",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: level.color, fontWeight: 700 }}>
          Force : {level.label}
        </span>
        <span style={{ fontSize: 10.5, color: "#64748B" }}>
          8+ car., chiffres & majuscules
        </span>
      </div>
    </div>
  );
}

export default function SignUpClient() {
  const searchParams = useSearchParams();
  const isPro = searchParams.get("plan") === "pro";

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
        plan: isPro ? "pro" : "starter",
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
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-card-accent-line" />

        <div className="auth-icon-circle success">
          <MailCheck size={28} />
        </div>

        <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 10px" }}>
          Vérifiez votre boîte mail
        </h1>

        <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 0 18px", lineHeight: 1.6 }}>
          Un lien d&apos;activation vient d&apos;être envoyé à :<br />
          <strong style={{ color: "#0F172A", fontWeight: 700 }}>{registeredEmail}</strong>
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
          💡 Cliquez sur le lien reçu pour activer votre compte. Pensez également à vérifier vos courriers indésirables (spams).
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            type="button"
            onClick={() => resendMutate(registeredEmail)}
            disabled={isResending}
            style={{
              width: "100%",
              height: 42,
              borderRadius: 9,
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
              color: "#1E293B",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              cursor: isResending ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {isResending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} color="#3B805C" />
            )}
            {isResending ? "Envoi en cours..." : "Renvoyer l'email de confirmation"}
          </button>

          <Link
            href="/sign-in"
            className="auth-back-link"
            style={{ justifyContent: "center", marginTop: 4 }}
          >
            <ArrowLeft size={14} />
            Retour à la page de connexion
          </Link>
        </div>
      </div>
    );
  }

  // ── Formulaire d'inscription harmonieux ──
  return (
    <div className="auth-card auth-card-wide">
      <div className="auth-card-accent-line" />

      {/* Dual Tab: Connexion / Inscription */}
      <div className="auth-segmented-nav">
        <Link href="/sign-in" className="auth-segmented-item inactive">
          Connexion
        </Link>
        <div className="auth-segmented-item active">
          Inscription
        </div>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        {isPro && (
          <div className="auth-pill-badge">
            <Zap size={13} fill="#3B805C" color="#3B805C" />
            <span>Essai Pro 14 jours inclus (0 FCFA · Zéro carte requise)</span>
          </div>
        )}
        <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 6px" }}>
          Rejoindre CoFlow
        </h1>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
          Créez votre premier espace de travail et synchronisez votre équipe en temps réel.
        </p>
      </div>

      {/* Formulaire épuré */}
      <form onSubmit={handleSubmit((d) => registerMutate(d))} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {/* Nom complet */}
        <div className="auth-input-group">
          <label className="auth-input-label">
            <span>Nom complet</span>
          </label>
          <div className="auth-input-wrapper">
            <User className="auth-input-icon" size={16} />
            <input
              type="text"
              placeholder="Alexandre Martin"
              {...register("name")}
              className={`auth-input-field ${errors.name ? "error" : ""}`}
            />
          </div>
          {errors.name && (
            <p className="auth-field-error">
              <AlertCircle size={12} />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="auth-input-group">
          <label className="auth-input-label">
            <span>Adresse email professionnelle</span>
          </label>
          <div className="auth-input-wrapper">
            <Mail className="auth-input-icon" size={16} />
            <input
              type="email"
              placeholder="alexandre@entreprise.com"
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

        {/* Mot de passe */}
        <div className="auth-input-group">
          <label className="auth-input-label">
            <span>Mot de passe</span>
          </label>
          <div className="auth-input-wrapper">
            <Lock className="auth-input-icon" size={16} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="8 caractères minimum"
              {...register("password")}
              className={`auth-input-field ${errors.password ? "error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-eye-btn"
              aria-label="Afficher ou masquer le mot de passe"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <StrengthBar password={passwordVal} />
          {errors.password && (
            <p className="auth-field-error">
              <AlertCircle size={12} />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirmer le mot de passe */}
        <div className="auth-input-group">
          <label className="auth-input-label">
            <span>Confirmer le mot de passe</span>
          </label>
          <div className="auth-input-wrapper">
            <Lock className="auth-input-icon" size={16} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Répétez votre mot de passe"
              {...register("confirmPassword")}
              className={`auth-input-field ${errors.confirmPassword ? "error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="auth-eye-btn"
              aria-label="Afficher ou masquer la confirmation du mot de passe"
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="auth-field-error">
              <AlertCircle size={12} />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Bouton d'inscription */}
        <button
          type="submit"
          disabled={isPending}
          className="auth-submit-btn"
          style={{ marginTop: 4 }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Création du compte...
            </>
          ) : (
            <>
              Créer mon compte
              <ArrowRight size={16} className="arrow-icon" />
            </>
          )}
        </button>
      </form>

      {/* Trust footer */}
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
        <span>Données hébergées en sécurité & conformes RGPD</span>
      </div>
    </div>
  );
}

