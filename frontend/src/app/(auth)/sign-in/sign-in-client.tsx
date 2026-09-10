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
import { CoFlowLogo } from "@/components/logo";

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
            Connexion
          </div>
          <Link
            href="/sign-up"
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
            Inscription
          </Link>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--foreground)", margin: "0 0 6px" }}>
          Connexion à CoFlow
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
          Accédez à vos projets et synchronisez votre équipe.
        </p>
      </div>

      {/* Alerte Email non vérifié */}
      {unverifiedEmail && (
        <div
          style={{
            marginBottom: 20,
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(217, 119, 6, 0.10)",
            border: "1px solid rgba(217, 119, 6, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12.5, color: "var(--foreground)", margin: 0, lineHeight: 1.45 }}>
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
        <div>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>
            Adresse email
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

        {/* Mot de passe */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--foreground)" }}>
              Mot de passe
            </label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "#3B805C", textDecoration: "none", fontWeight: 600 }}>
              Mot de passe oublié ?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
          {errors.password && (
            <p style={{ fontSize: 11.5, color: "#DC2626", marginTop: 5, margin: "5px 0 0", fontWeight: 500 }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Bouton de connexion */}
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
              Connexion en cours...
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight size={16} className="lp-arrow" />
            </>
          )}
        </button>
      </form>

      {/* Trust mark footer */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 16,
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 11.5,
          color: "var(--muted-foreground)",
        }}
      >
        <ShieldCheck size={13} color="#3B805C" />
        <span>Connexion sécurisée & chiffrée SSL</span>
      </div>
    </div>
  );
}
