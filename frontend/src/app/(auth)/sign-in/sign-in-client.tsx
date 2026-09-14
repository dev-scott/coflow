"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  ShieldCheck, AlertCircle, Send
} from "lucide-react";
import { postData } from "@/lib/fetch-util";
import type { AuthResponse } from "@/types";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormData = z.infer<typeof schema>;

export default function SignInClient() {
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from");
  const from = (rawFrom && !rawFrom.startsWith("/api") && !rawFrom.startsWith("/sign") && !rawFrom.startsWith("/auth"))
    ? rawFrom
    : "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: (data: FormData) => postData<AuthResponse>("/auth/login", data),
    onSuccess: async (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("coflow_token", data.token);
        document.cookie = `coflow_token=${encodeURIComponent(data.token)}; path=/; max-age=604800; SameSite=Lax`;
      }
      try {
        await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: data.token }),
        });
      } catch (e) {
        console.error("set-token fetch error:", e);
      }
      toast.success(`Bienvenue, ${data.user.name} !`);
      window.location.href = from;
    },
    onError: (err: any) => {
      const msg = err.message || "Identifiants invalides";
      if (msg.includes("vérifier votre adresse email") || err.emailNotVerified) {
        setUnverifiedEmail(err.email || null);
        toast.warning(msg);
      } else {
        toast.error(msg);
      }
    },
  });

  const { mutate: resendMutate, isPending: isResending } = useMutation({
    mutationFn: (email: string) => postData<{ message: string }>("/auth/resend-verification", { email }),
    onSuccess: (data) => {
      toast.success(data.message || "Email de confirmation renvoyé !");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Impossible de renvoyer l'email");
    },
  });

  return (
    <div className="auth-card">
      <div className="auth-card-accent-line" />

      {/* Dual Segmented Tab: Connexion / Inscription */}
      <div className="auth-segmented-nav">
        <div className="auth-segmented-item active">
          Connexion
        </div>
        <Link href="/sign-up" className="auth-segmented-item inactive">
          Inscription
        </Link>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", margin: "0 0 6px" }}>
          Connexion à votre espace
        </h1>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
          Retrouvez vos projets, vos tâches et synchronisez votre équipe en temps réel.
        </p>
      </div>

      {/* Alerte Email non vérifié */}
      {unverifiedEmail && (
        <div className="auth-alert-warning">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12.5, color: "#0F172A", margin: 0, lineHeight: 1.45 }}>
              Votre compte n&apos;est pas encore activé. Veuillez cliquer sur le lien envoyé à <strong>{unverifiedEmail}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => resendMutate(unverifiedEmail)}
            disabled={isResending}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 700,
              color: "#D97706",
              background: "none",
              border: "none",
              padding: 0,
              cursor: isResending ? "not-allowed" : "pointer",
            }}
          >
            <Send size={12} />
            {isResending ? "Envoi en cours..." : "Renvoyer l'email d'activation"}
          </button>
        </div>
      )}

      {/* Formulaire de connexion direct */}
      <form onSubmit={handleSubmit((d) => loginMutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Email */}
        <div className="auth-input-group">
          <label className="auth-input-label">
            <span>Adresse email</span>
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

        {/* Mot de passe */}
        <div className="auth-input-group">
          <div className="auth-input-label">
            <span>Mot de passe</span>
            <Link
              href="/forgot-password"
              style={{
                fontSize: 12,
                color: "#3B805C",
                textDecoration: "none",
                fontWeight: 600,
                transition: "color 0.15s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#2D6A4F")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#3B805C")}
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="auth-input-wrapper">
            <Lock className="auth-input-icon" size={16} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
          {errors.password && (
            <p className="auth-field-error">
              <AlertCircle size={12} />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Bouton de connexion */}
        <button
          type="submit"
          disabled={isPending}
          className="auth-submit-btn"
          style={{ marginTop: 4 }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Connexion en cours...
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight size={16} className="arrow-icon" />
            </>
          )}
        </button>
      </form>

      {/* Trust mark footer */}
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
        <span>Connexion sécurisée & chiffrée SSL 256-bit</span>
      </div>
    </div>
  );
}

