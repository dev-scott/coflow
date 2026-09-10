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
  CheckCircle2, Sparkles, FolderKanban, ShieldCheck, Zap
} from "lucide-react";
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

function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Faible", color: "#DC2626", bg: "#FEE2E2" },
    { label: "Moyen", color: "#D97706", bg: "#FEF3C7" },
    { label: "Bon", color: "#3B805C", bg: "#DCFCE7" },
    { label: "Robuste", color: "#3B805C", bg: "#DCFCE7" },
  ];
  const level = levels[Math.min(score - 1, 3)] ?? { label: "Faible", color: "#DC2626", bg: "#FEE2E2" };
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
              background: i <= filledBars ? level.color : "#E2E8F0",
              transition: "background 0.25s ease",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: level.color, fontWeight: 700 }}>
          Force du mot de passe : {level.label}
        </span>
        <span style={{ fontSize: 10.5, color: "#64748B" }}>
          8+ car., chiffres & majuscules
        </span>
      </div>
    </div>
  );
}

export default function SignUpClient() {
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const passwordVal = watch("password") || "";

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
      {/* ── Left Column: Clean Sign Up Form ── */}
      <div
        style={{
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <div style={{ marginBottom: 24 }}>
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
            <Sparkles size={13} />
            Inscription 100% Gratuite
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "#0F172A", margin: "0 0 8px" }}>
            Rejoignez CoFlow
          </h1>
          <p style={{ fontSize: 13.5, color: "#475569", margin: 0, lineHeight: 1.5 }}>
            Créez votre premier espace de travail en moins de 2 minutes.
          </p>
        </div>

        {/* Guarantees row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {["0€ sans limite", "Zéro carte requise", "Déploiement immédiat"].map((perk) => (
            <span
              key={perk}
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 6,
                background: "#F1F5F9",
                color: "#334155",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <CheckCircle2 size={12} color="#3B805C" />
              {perk}
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Nom complet */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
              Nom complet
            </label>
            <div style={{ position: "relative" }}>
              <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type="text"
                placeholder="Alexandre Martin"
                {...register("name")}
                style={{
                  width: "100%",
                  padding: "11px 12px 11px 38px",
                  background: "#FFFFFF",
                  border: errors.name ? "1px solid #DC2626" : "1px solid #CBD5E1",
                  borderRadius: 10,
                  color: "#0F172A",
                  fontSize: 13.5,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
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
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
              Adresse email professionnelle
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type="email"
                placeholder="alexandre@entreprise.com"
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

          {/* Mot de passe */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
              Mot de passe
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="8 caractères minimum"
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
            <StrengthBar password={passwordVal} />
            {errors.password && (
              <p style={{ fontSize: 11.5, color: "#DC2626", marginTop: 5, margin: "5px 0 0", fontWeight: 500 }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirmer le mot de passe */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
              Confirmer le mot de passe
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Répétez votre mot de passe"
                {...register("confirmPassword")}
                style={{
                  width: "100%",
                  padding: "11px 12px 11px 38px",
                  background: "#FFFFFF",
                  border: errors.confirmPassword ? "1px solid #DC2626" : "1px solid #CBD5E1",
                  borderRadius: 10,
                  color: "#0F172A",
                  fontSize: 13.5,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  transition: "border-color 0.15s ease",
                }}
              />
            </div>
            {errors.confirmPassword && (
              <p style={{ fontSize: 11.5, color: "#DC2626", marginTop: 5, margin: "5px 0 0", fontWeight: 500 }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit CTA */}
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
              marginTop: 8,
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
                Création du compte...
              </>
            ) : (
              <>
                Créer mon compte gratuitement
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
            Déjà membre de CoFlow ?{" "}
            <Link href="/sign-in" style={{ color: "#3B805C", fontWeight: 700, textDecoration: "none" }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Column: Interactive Highlights ── */}
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
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", margin: "0 0 8px" }}>
            Ce qui est inclus dès l'inscription
          </h2>
          <p style={{ fontSize: 13, color: "#475569", margin: "0 0 24px" }}>
            Accédez à toutes les fonctionnalités essentielles sans restriction.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                icon: FolderKanban,
                title: "3 Workspaces d'équipe",
                desc: "Cloisonnez vos projets, invitez vos collègues et attribuez les rôles.",
                badge: "Inclus",
              },
              {
                icon: Zap,
                title: "Kanban fluide sans friction",
                desc: "Glissez vos tâches, définissez priorités et suivez l'avancement en direct.",
                badge: "Illimité",
              },
              {
                icon: ShieldCheck,
                title: "Sécurité & Hébergement UE",
                desc: "Chiffrement SSL 256-bit, conformité RGPD et données hébergées en Europe.",
                badge: "RGPD",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 14,
                    padding: "16px 18px",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "rgba(77, 153, 114, 0.12)",
                      color: "#3B805C",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                        {item.title}
                      </p>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: "#EEF1F6",
                          color: "#334155",
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#475569", margin: 0, lineHeight: 1.45 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonial pill */}
        <div
          style={{
            marginTop: 28,
            padding: "16px 18px",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
          }}
        >
          <p style={{ fontSize: 12.5, color: "#1E293B", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
            &ldquo;CoFlow a remplacé trois outils distincts chez nous. La simplicité est déconcertante.&rdquo;
          </p>
          <p style={{ fontSize: 11.5, color: "#475569", marginTop: 8, margin: "8px 0 0", fontWeight: 600 }}>
            — Sarah M., Head of Product chez PixelNova
          </p>
        </div>
      </div>
    </div>
  );
}
