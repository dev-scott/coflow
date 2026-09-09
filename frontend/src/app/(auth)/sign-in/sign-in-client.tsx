"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { postData } from "@/lib/fetch-util";
import type { AuthResponse } from "@/types";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormData = z.infer<typeof schema>;

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from");
  const from = (rawFrom && !rawFrom.startsWith("/api") && !rawFrom.startsWith("/sign") && !rawFrom.startsWith("/auth"))
    ? rawFrom
    : "/dashboard";
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
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
    onError: (err: Error) => {
      toast.error(err.message || "Identifiants invalides");
    },
  });

  const handleQuickDemo = () => {
    setValue("email", "demo@example.com");
    setValue("password", "Password123!");
    mutate({ email: "demo@example.com", password: "Password123!" });
  };

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
      {/* Top ambient highlight line */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: "20%",
          right: "20%",
          height: 1,
          background: "linear-gradient(90deg, transparent, #7c3aed, transparent)",
        }}
      />

      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#f1f5f9", margin: "0 0 6px" }}>
          Connexion
        </h1>
        <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>
          Accédez à vos workspaces et suivez vos livrables.
        </p>
      </div>

      {/* Quick Demo Button */}
      <button
        type="button"
        onClick={handleQuickDemo}
        disabled={isPending}
        style={{
          width: "100%",
          padding: "10px 14px",
          marginBottom: 22,
          background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))",
          border: "1px solid rgba(124,58,237,0.30)",
          borderRadius: 8,
          color: "#c4b5fd",
          fontSize: 12.5,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.15s ease",
        }}
      >
        <Sparkles size={14} color="#a78bfa" />
        Accès Démo instantané en 1 clic
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#52525b" }}>
          ou avec vos identifiants
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Email Field */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 7 }}>
            Adresse email
          </label>
          <div style={{ position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
            <input
              type="email"
              placeholder="nom@entreprise.com"
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
                transition: "border-color 0.15s ease",
              }}
            />
          </div>
          {errors.email && (
            <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5, margin: "5px 0 0" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa" }}>
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              style={{ fontSize: 11.5, color: "#8b5cf6", textDecoration: "none", fontWeight: 500 }}
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
                padding: 0,
                cursor: "pointer",
                color: "#52525b",
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 5, margin: "5px 0 0" }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="lp-btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 42,
            marginTop: 6,
            borderRadius: 8,
            fontSize: 13.5,
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin-slow" />
              Connexion en cours...
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight size={15} className="lp-arrow" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div style={{ marginTop: 26, textAlign: "center" }}>
        <p style={{ fontSize: 12.5, color: "#71717a", margin: 0 }}>
          Vous n'avez pas encore de compte ?{" "}
          <Link
            href="/sign-up"
            style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
