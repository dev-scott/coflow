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
  FolderKanban, Sparkles, ShieldCheck
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
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        width: "100%",
        maxWidth: 960,
        borderRadius: 24,
        overflow: "hidden",
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 20px 48px -12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* ── Left Column: Clean & Intuitive Form ── */}
      <div
        style={{
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 999,
              background: "rgba(77, 153, 114, 0.10)",
              border: "1px solid rgba(77, 153, 114, 0.22)",
              color: "#3B805C",
              fontSize: 11.5,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            <ShieldCheck size={13} />
            Espace Sécurisé
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "#0F172A", margin: "0 0 8px" }}>
            Bon retour parmi nous
          </h1>
          <p style={{ fontSize: 13.5, color: "#475569", margin: 0, lineHeight: 1.5 }}>
            Accédez à vos flux de travail et synchronisez vos livrables.
          </p>
        </div>

        {/* ⚡ Prominent 1-Click Demo Button */}
        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={isPending}
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: 22,
            background: "#F8FAFC",
            border: "1.5px dashed #CBD5E1",
            borderRadius: 12,
            color: "#1E293B",
            fontSize: 13,
            fontWeight: 700,
            cursor: isPending ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "#3B805C";
            e.currentTarget.style.background = "rgba(77, 153, 114, 0.04)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "#CBD5E1";
            e.currentTarget.style.background = "#F8FAFC";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 24, height: 24, borderRadius: 6,
              background: "rgba(77, 153, 114, 0.15)", color: "#3B805C",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12
            }}>
              ⚡
            </span>
            <span>Tester immédiatement (Compte Démo)</span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 6,
              background: "#334155",
              color: "#FFFFFF",
            }}
          >
            1-clic
          </span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748B", fontWeight: 600 }}>
            ou avec vos identifiants
          </span>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
        </div>

        <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
              Adresse email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type="email"
                placeholder="nom@entreprise.com"
                {...register("email")}
                style={{
                  width: "100%",
                  padding: "11px 12px 11px 38px",
                  background: "#FFFFFF",
                  border: errors.email ? "1px solid #DC2626" : "1px solid #CBD5E1",
                  borderRadius: 10,
                  color: "#0F172A",
                  fontSize: 13.5,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
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

          {/* Password */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1E293B" }}>
                Mot de passe
              </label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: "#3B805C", textDecoration: "none", fontWeight: 600 }}>
                Mot de passe oublié ?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                style={{
                  width: "100%",
                  padding: "11px 40px 11px 38px",
                  background: "#FFFFFF",
                  border: errors.password ? "1px solid #DC2626" : "1px solid #CBD5E1",
                  borderRadius: 10,
                  color: "#0F172A",
                  fontSize: 13.5,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
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
                  color: "#64748B",
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 44,
              marginTop: 6,
              background: isPending ? "#475569" : "#1E293B",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              transition: "background 0.15s ease, transform 0.12s ease",
              boxShadow: "0 2px 6px rgba(30, 41, 59, 0.15)",
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
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
            Pas encore de compte ?{" "}
            <Link href="/sign-up" style={{ color: "#3B805C", fontWeight: 700, textDecoration: "none" }}>
              Créer un compte gratuitement
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Column: Interactive Workspace Showcase ── */}
      <div
        style={{
          background: "#F8FAFC",
          padding: "48px 36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderLeft: "1px solid #E2E8F0",
        }}
      >
        <div>
          {/* Header of Preview */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(77, 153, 114, 0.12)", color: "#3B805C",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FolderKanban size={18} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  Workspace CoFlow
                </p>
                <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>
                  Sprint actif · Équipe Produit
                </p>
              </div>
            </div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11, fontWeight: 600, color: "#3B805C",
              background: "rgba(77, 153, 114, 0.10)", padding: "3px 8px", borderRadius: 999,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B805C" }} />
              En temps réel
            </span>
          </div>

          {/* Interactive Mock Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Card 1 */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "16px 18px",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: "rgba(77, 153, 114, 0.12)", color: "#3B805C",
                }}>
                  En cours
                </span>
                <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>85% terminé</span>
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", margin: "0 0 10px" }}>
                Refonte Design System & Interface
              </p>
              <div style={{ height: 6, background: "#EEF1F6", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: "85%", height: "100%", background: "#3B805C", borderRadius: 999 }} />
              </div>
            </div>

            {/* Card 2 */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "16px 18px",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: "rgba(217, 119, 6, 0.12)", color: "#D97706",
                }}>
                  Priorité Haute
                </span>
                <span style={{ fontSize: 11, color: "#64748B" }}>Échéance demain</span>
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Synchronisation des livrables clients
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof / Trust */}
        <div
          style={{
            marginTop: 28,
            padding: "14px 16px",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(77, 153, 114, 0.12)", color: "#3B805C",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <Sparkles size={16} />
          </div>
          <p style={{ fontSize: 12, color: "#334155", margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
            <strong style={{ color: "#0F172A" }}>+40% de vélocité</strong> constatée dès les premières semaines d'utilisation en équipe.
          </p>
        </div>
      </div>
    </div>
  );
}
