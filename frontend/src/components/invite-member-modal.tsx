"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  X, Mail, ShieldCheck, UserCheck, Eye, Copy,
  Check, Loader2, Send, Users, Sparkles
} from "lucide-react";
import { postData } from "@/lib/fetch-util";
import type { WorkspaceMemberRole } from "@/types";

const inviteSchema = z.object({
  email: z.string().email("Adresse email valide requise"),
  role: z.enum(["admin", "member", "viewer"] as const),
});

type InviteForm = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
  workspaceId: string;
  workspaceName?: string;
  isOpen: boolean;
  onClose: () => void;
  onLimitReached?: () => void;
}

const ROLES: { role: "admin" | "member" | "viewer"; title: string; desc: string; icon: any }[] = [
  {
    role: "member",
    title: "Membre",
    desc: "Peut créer, modifier et collaborer sur les projets et tâches",
    icon: UserCheck,
  },
  {
    role: "admin",
    title: "Administrateur",
    desc: "Gestion complète de l'espace, des membres et des projets",
    icon: ShieldCheck,
  },
  {
    role: "viewer",
    title: "Lecteur",
    desc: "Consultation uniquement des projets et tableaux de bord",
    icon: Eye,
  },
];

export function InviteMemberModal({
  workspaceId,
  workspaceName,
  isOpen,
  onClose,
  onLimitReached,
}: InviteMemberModalProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const selectedRole = watch("role");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: InviteForm) =>
      postData<{ message: string; inviteLink?: string; token?: string }>(
        `/workspaces/${workspaceId}/invite`,
        data
      ),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-projects", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-stats", workspaceId] });

      toast.success(res.message || "Invitation envoyée avec succès !");
      if (res.inviteLink) {
        setGeneratedLink(res.inviteLink);
      } else {
        handleClose();
      }
    },
    onError: (err: any) => {
      const msg = err.message || "Erreur lors de l'envoi de l'invitation";
      toast.error(msg);
      if (
        msg.includes("Starter") ||
        msg.includes("plan Pro") ||
        err.code === "PLAN_LIMIT_REACHED"
      ) {
        handleClose();
        if (onLimitReached) onLimitReached();
      }
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    setGeneratedLink(null);
    setCopied(false);
    onClose();
  };

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Lien d'invitation copié dans le presse-papiers !");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.15)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(59, 128, 92, 0.12)",
                color: "#3B805C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#1E293B", margin: 0 }}>
                Inviter un collaborateur
              </h2>
              {workspaceName && (
                <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>
                  Espace : <span style={{ fontWeight: 600, color: "#334155" }}>{workspaceName}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#94A3B8",
              padding: 4,
              borderRadius: 6,
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Success View with Direct Link */}
        {generatedLink ? (
          <div>
            <div
              style={{
                background: "rgba(59, 128, 92, 0.08)",
                border: "1px solid rgba(59, 128, 92, 0.2)",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#2D6A4F", margin: "0 0 6px" }}>
                Invitation créée avec succès !
              </p>
              <p style={{ fontSize: 12.5, color: "#475569", margin: 0, lineHeight: 1.5 }}>
                Un email a été envoyé. Vous pouvez aussi copier directement ce lien pour le partager à votre collègue :
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <input
                type="text"
                readOnly
                value={generatedLink}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  background: "#F8FAFC",
                  border: "1px solid #CBD5E1",
                  borderRadius: 8,
                  color: "#334155",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => handleCopy(generatedLink)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 16px",
                  background: copied ? "#22C55E" : "#3B805C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setGeneratedLink(null);
                  reset();
                }}
                style={{
                  flex: 1,
                  height: 40,
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  color: "#475569",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Inviter un autre membre
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="lp-btn-pro"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  height: 40,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                Terminer
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit((d) => mutate(d))}>
            {/* Email Field */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                Adresse email du collaborateur *
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                  }}
                />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="collegue@entreprise.com"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    background: "#F8FAFC",
                    border: errors.email ? "1px solid #EF4444" : "1px solid #CBD5E1",
                    borderRadius: 8,
                    color: "#1E293B",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
              </div>
              {errors.email && (
                <p style={{ fontSize: 11.5, color: "#EF4444", margin: "4px 0 0" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 8 }}>
                Rôle & Permissions
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ROLES.map(({ role, title, desc, icon: Icon }) => {
                  const isSelected = selectedRole === role;
                  return (
                    <div
                      key={role}
                      onClick={() => setValue("role", role)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${isSelected ? "#3B805C" : "#E2E8F0"}`,
                        background: isSelected ? "rgba(59, 128, 92, 0.05)" : "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: isSelected ? "rgba(59, 128, 92, 0.15)" : "#F1F5F9",
                          color: isSelected ? "#3B805C" : "#64748B",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: isSelected ? "#2D6A4F" : "#1E293B" }}>
                          {title}
                        </p>
                        <p style={{ fontSize: 11.5, color: "#64748B", margin: 0, lineHeight: 1.3 }}>
                          {desc}
                        </p>
                      </div>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: `2px solid ${isSelected ? "#3B805C" : "#CBD5E1"}`,
                          background: isSelected ? "#3B805C" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFFFFF" }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1,
                  height: 40,
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  color: "#475569",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="lp-btn-pro"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  height: 40,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin-slow" />
                    Envoi de l'invitation...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Envoyer l'invitation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
