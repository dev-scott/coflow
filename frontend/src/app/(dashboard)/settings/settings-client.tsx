"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Lock, Save, Shield, Bell, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { fetchData, putData } from "@/lib/fetch-util";
import type { User as UserType } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, "Au moins 2 caractères requis"),
  profilePicture: z.string().url("URL d'image invalide").or(z.literal("")).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(8, "Au moins 8 caractères requis"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les nouveaux mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsClient() {
  const { user: authUser } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  const { data: user } = useQuery<UserType>({
    queryKey: ["auth", "me"],
    queryFn: () => fetchData("/users/profile"),
    enabled: !!authUser,
  });

  // Profile form
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? "", profilePicture: user?.profilePicture ?? "" },
  });

  const { mutate: saveProfile, isPending: savingProfile } = useMutation({
    mutationFn: (d: ProfileForm) => putData("/users/profile", d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profil mis à jour avec succès !");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur de mise à jour"),
  });

  // Password form
  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const { mutate: changePassword, isPending: changingPwd } = useMutation({
    mutationFn: (d: PasswordForm) => putData("/users/change-password", d),
    onSuccess: () => {
      resetPwd();
      toast.success("Mot de passe mis à jour avec succès !");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur lors du changement de mot de passe"),
  });

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: "#1E293B", margin: "0 0 4px" }}>
          Paramètres du compte
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
          Gérez votre profil public, votre sécurité et vos préférences d'accès.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div
        className="glass-card"
        style={{
          padding: "24px 28px",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 24,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(77, 153, 114, 0.12)",
            border: "2px solid rgba(77, 153, 114, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 800,
            color: "#3B805C",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            user?.name?.charAt(0).toUpperCase() ?? "U"
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1E293B", margin: 0 }}>
              {user?.name ?? "Chargement..."}
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 999,
                background: "rgba(77, 153, 114, 0.12)",
                color: "#3B805C",
              }}
            >
              Compte vérifié
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
            {user?.email ?? ""}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid #E2E8F0",
          marginBottom: 24,
          paddingBottom: 4,
        }}
      >
        <button
          onClick={() => setActiveTab("profile")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 6,
            background: activeTab === "profile" ? "#EEF1F6" : "transparent",
            color: activeTab === "profile" ? "#1E293B" : "#64748B",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <User size={15} />
          Profil & Coordonnées
        </button>

        <button
          onClick={() => setActiveTab("security")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 6,
            background: activeTab === "security" ? "#EEF1F6" : "transparent",
            color: activeTab === "security" ? "#1E293B" : "#64748B",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <Shield size={15} />
          Sécurité & Mot de passe
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === "profile" && (
        <div className="glass-card" style={{ padding: "28px", borderRadius: 14, background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <form onSubmit={handleProfile((d) => saveProfile(d))} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 7 }}>
                Nom affiché
              </label>
              <input
                {...regProfile("name")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#FFFFFF",
                  border: profileErrors.name ? "1px solid #ef4444" : "1px solid #CBD5E1",
                  borderRadius: 8,
                  color: "#1E293B",
                  fontSize: 13.5,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              />
              {profileErrors.name && (
                <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
                  {profileErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 7 }}>
                URL de photo de profil (facultatif)
              </label>
              <input
                {...regProfile("profilePicture")}
                placeholder="https://images.unsplash.com/..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#FFFFFF",
                  border: profileErrors.profilePicture ? "1px solid #ef4444" : "1px solid #CBD5E1",
                  borderRadius: 8,
                  color: "#1E293B",
                  fontSize: 13.5,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              />
              {profileErrors.profilePicture && (
                <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
                  {profileErrors.profilePicture.message}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 7 }}>
                Adresse email associée
              </label>
              <input
                value={user?.email ?? ""}
                disabled
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  color: "#64748B",
                  fontSize: 13.5,
                  cursor: "not-allowed",
                }}
              />
              <span style={{ fontSize: 11, color: "#64748B", marginTop: 4, display: "block" }}>
                L'adresse email est le principal identifiant de connexion et ne peut pas être changée ici.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button
                type="submit"
                disabled={savingProfile}
                className="lp-btn-pro"
                style={{ height: 40, borderRadius: 8, fontSize: 13 }}
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={14} className="animate-spin-slow" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Sauvegarder les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security */}
      {activeTab === "security" && (
        <div className="glass-card" style={{ padding: "28px", borderRadius: 14, background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <form onSubmit={handlePwd((d) => changePassword(d))} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 7 }}>
                Mot de passe actuel
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...regPwd("currentPassword")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#FFFFFF",
                  border: pwdErrors.currentPassword ? "1px solid #ef4444" : "1px solid #CBD5E1",
                  borderRadius: 8,
                  color: "#1E293B",
                  fontSize: 13.5,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              />
              {pwdErrors.currentPassword && (
                <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
                  {pwdErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 7 }}>
                Nouveau mot de passe
              </label>
              <input
                type="password"
                placeholder="8 caractères minimum"
                {...regPwd("newPassword")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#FFFFFF",
                  border: pwdErrors.newPassword ? "1px solid #ef4444" : "1px solid #CBD5E1",
                  borderRadius: 8,
                  color: "#1E293B",
                  fontSize: 13.5,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              />
              {pwdErrors.newPassword && (
                <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
                  {pwdErrors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 7 }}>
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...regPwd("confirmPassword")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#FFFFFF",
                  border: pwdErrors.confirmPassword ? "1px solid #ef4444" : "1px solid #CBD5E1",
                  borderRadius: 8,
                  color: "#1E293B",
                  fontSize: 13.5,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              />
              {pwdErrors.confirmPassword && (
                <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
                  {pwdErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button
                type="submit"
                disabled={changingPwd}
                className="lp-btn-pro"
                style={{ height: 40, borderRadius: 8, fontSize: 13 }}
              >
                {changingPwd ? (
                  <>
                    <Loader2 size={14} className="animate-spin-slow" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    Mettre à jour le mot de passe
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
