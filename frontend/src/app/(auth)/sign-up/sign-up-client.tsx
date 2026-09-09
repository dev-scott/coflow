"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";
import { postData } from "@/lib/fetch-util";
import type { AuthResponse } from "@/types";

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

export default function SignUpClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const passwordVal = watch("password") || "";
  const getPasswordStrength = () => {
    if (!passwordVal) return { score: 0, label: "", color: "#333" };
    let score = 0;
    if (passwordVal.length >= 8) score++;
    if (/[A-Z]/.test(passwordVal)) score++;
    if (/[0-9]/.test(passwordVal)) score++;
    if (/[^A-Za-z0-9]/.test(passwordVal)) score++;

    if (score <= 1) return { score: 1, label: "Trop court / Faible", color: "#ef4444" };
    if (score <= 3) return { score: 2, label: "Moyen", color: "#f59e0b" };
    return { score: 3, label: "Robuste", color: "#10b981" };
  };

  const strength = getPasswordStrength();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      postData<AuthResponse>("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      }),
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
      toast.success("Compte créé avec succès ! Bienvenue 🎉");
      window.location.href = "/dashboard";
    },
    onError: (err: Error) => {
      toast.error(err.message || "Impossible de créer le compte");
    },
  });

  return (
    <div
      style={{
        background: "rgba(17, 17, 24, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 16,
        padding: "36px 32px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
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
          height: 1,
          background: "linear-gradient(90deg, transparent, #06b6d4, transparent)",
        }}
      />

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#f1f5f9", margin: "0 0 6px" }}>
          Créer un compte
        </h1>
        <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>
          Rejoignez CoFlow et organisez vos projets d'équipe.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Name Field */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
            Nom complet
          </label>
          <div style={{ position: "relative" }}>
            <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
            <input
              type="text"
              placeholder="Alexandre Martin"
              {...register("name")}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                background: "rgba(255,255,255,0.03)",
                border: errors.name ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                color: "#f1f5f9",
                fontSize: 13.5,
                outline: "none",
              }}
            />
          </div>
          {errors.name && (
            <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
            Adresse email professionnelle
          </label>
          <div style={{ position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
            <input
              type="email"
              placeholder="alex@entreprise.com"
              {...register("email")}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                background: "rgba(255,255,255,0.03)",
                border: errors.email ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                color: "#f1f5f9",
                fontSize: 13.5,
                outline: "none",
              }}
            />
          </div>
          {errors.email && (
            <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
            Mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="8 caractères minimum"
              {...register("password")}
              style={{
                width: "100%",
                padding: "10px 38px 10px 36px",
                background: "rgba(255,255,255,0.03)",
                border: errors.password ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                color: "#f1f5f9",
                fontSize: 13.5,
                outline: "none",
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
                padding: 0,
                cursor: "pointer",
                color: "#52525b",
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Strength Bar */}
          {passwordVal.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 4, height: 3, marginBottom: 4 }}>
                <div style={{ flex: 1, borderRadius: 2, background: strength.score >= 1 ? strength.color : "rgba(255,255,255,0.08)" }} />
                <div style={{ flex: 1, borderRadius: 2, background: strength.score >= 2 ? strength.color : "rgba(255,255,255,0.08)" }} />
                <div style={{ flex: 1, borderRadius: 2, background: strength.score >= 3 ? strength.color : "rgba(255,255,255,0.08)" }} />
              </div>
              <span style={{ fontSize: 11, color: strength.color, fontWeight: 500 }}>
                {strength.label}
              </span>
            </div>
          )}

          {errors.password && (
            <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
            Confirmer le mot de passe
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                background: "rgba(255,255,255,0.03)",
                border: errors.confirmPassword ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                color: "#f1f5f9",
                fontSize: 13.5,
                outline: "none",
              }}
            />
          </div>
          {errors.confirmPassword && (
            <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 42,
            marginTop: 8,
            borderRadius: 8,
            fontSize: 13.5,
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin-slow" />
              Création du compte...
            </>
          ) : (
            <>
              Créer mon compte gratuitement
              <ArrowRight size={15} className="lp-arrow" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <p style={{ fontSize: 12.5, color: "#71717a", margin: 0 }}>
          Vous avez déjà un compte ?{" "}
          <Link
            href="/sign-in"
            style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
