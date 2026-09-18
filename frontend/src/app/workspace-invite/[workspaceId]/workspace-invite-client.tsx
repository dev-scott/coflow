"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users, ShieldCheck, UserCheck, Eye, ArrowRight,
  CheckCircle2, AlertCircle, Loader2, Sparkles, LogIn, UserPlus
} from "lucide-react";
import { fetchData, postData } from "@/lib/fetch-util";
import { useAuth } from "@/providers/auth-provider";
import { CoFlowLogo } from "@/components/logo";

interface InviteInfoResponse {
  workspace: {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    owner?: { name: string; email: string };
    memberCount: number;
  };
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
}

const ROLE_LABELS: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  admin: { label: "Administrateur", icon: ShieldCheck, color: "#334155", bg: "rgba(51, 65, 85, 0.1)" },
  member: { label: "Membre", icon: UserCheck, color: "#3B805C", bg: "rgba(59, 128, 92, 0.12)" },
  viewer: { label: "Lecteur", icon: Eye, color: "#64748B", bg: "rgba(100, 116, 139, 0.1)" },
};

export default function WorkspaceInviteClient({ workspaceId }: { workspaceId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const token = searchParams.get("tk");

  const { data, isLoading, error } = useQuery<InviteInfoResponse>({
    queryKey: ["invite-info", token],
    queryFn: () => fetchData(`/workspaces/invite-info?token=${encodeURIComponent(token || "")}`),
    enabled: Boolean(token),
    retry: 1,
  });

  const { mutate: acceptInvite, isPending: isAccepting } = useMutation({
    mutationFn: () => postData<{ message: string; workspaceId: string }>("/workspaces/accept-invite-by-token", { token }),
    onSuccess: (res) => {
      toast.success(res.message || "Vous avez rejoint l'espace avec succès !");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-projects", workspaceId] });
      router.push(`/workspaces/${workspaceId}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Impossible d'accepter l'invitation");
    },
  });

  const currentPathWithToken = `/workspace-invite/${workspaceId}?tk=${encodeURIComponent(token || "")}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 10%, rgba(59, 128, 92, 0.08) 0%, #F4F6F9 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Brand logo */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <CoFlowLogo />
        </Link>
      </div>

      {/* Main card */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
          textAlign: "center",
        }}
      >
        {/* Loading State */}
        {(isLoading || authLoading) && (
          <div style={{ padding: "40px 0" }}>
            <Loader2 size={36} className="animate-spin-slow" color="#3B805C" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
              Vérification de l'invitation en cours...
            </p>
          </div>
        )}

        {/* Error State: missing or invalid token */}
        {(!token || error) && !isLoading && (
          <div>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <AlertCircle size={28} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", margin: "0 0 8px" }}>
              Lien d'invitation invalide ou expiré
            </h1>
            <p style={{ fontSize: 13.5, color: "#64748B", margin: "0 0 24px", lineHeight: 1.6 }}>
              Ce lien d'invitation n'est plus valable, a déjà été utilisé ou est incomplet. Veuillez demander à l'administrateur de vous renvoyer une invitation.
            </p>
            <Link
              href="/dashboard"
              className="lp-btn-pro"
              style={{ justifyContent: "center", width: "100%", height: 44, borderRadius: 10, textDecoration: "none" }}
            >
              Aller au tableau de bord
            </Link>
          </div>
        )}

        {/* Success / Ready State */}
        {data && !isLoading && (
          <div>
            {/* Workspace badge icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: data.workspace.color || "#3B805C",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 26,
                fontWeight: 900,
                boxShadow: `0 8px 24px ${data.workspace.color ? `${data.workspace.color}40` : "rgba(59, 128, 92, 0.3)"}`,
              }}
            >
              {data.workspace.name.charAt(0).toUpperCase()}
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(59, 128, 92, 0.1)", color: "#2D6A4F", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
              <Sparkles size={13} />
              <span>Invitation à collaborer</span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: "#1E293B", margin: "0 0 8px" }}>
              {data.workspace.name}
            </h1>

            {data.workspace.description && (
              <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 16px", lineHeight: 1.5 }}>
                {data.workspace.description}
              </p>
            )}

            {/* Role & Owner info box */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "14px 18px",
                margin: "18px 0 24px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {data.workspace.owner?.name && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                  <span style={{ color: "#64748B" }}>Invité par :</span>
                  <span style={{ fontWeight: 600, color: "#1E293B" }}>{data.workspace.owner.name}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                <span style={{ color: "#64748B" }}>Rôle assigné :</span>
                {(() => {
                  const r = ROLE_LABELS[data.role] || ROLE_LABELS.member;
                  const Icon = r.icon;
                  return (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: r.bg,
                        color: r.color,
                      }}
                    >
                      <Icon size={12} />
                      {r.label}
                    </span>
                  );
                })()}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                <span style={{ color: "#64748B" }}>Équipe actuelle :</span>
                <span style={{ fontWeight: 600, color: "#1E293B", display: "flex", alignItems: "center", gap: 5 }}>
                  <Users size={13} color="#64748B" />
                  {data.workspace.memberCount} membre{data.workspace.memberCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Auth check: Logged in vs Not logged in */}
            {isAuthenticated ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "rgba(59, 128, 92, 0.06)",
                    borderRadius: 8,
                    marginBottom: 20,
                    textAlign: "left",
                  }}
                >
                  <CheckCircle2 size={16} color="#3B805C" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>
                    Vous rejoindrez en tant que <strong>{user?.name}</strong> ({user?.email})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => acceptInvite()}
                  disabled={isAccepting}
                  className="lp-btn-pro"
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    justifyContent: "center",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {isAccepting ? (
                    <>
                      <Loader2 size={16} className="animate-spin-slow" />
                      Adhésion en cours...
                    </>
                  ) : (
                    <>
                      Accepter et rejoindre l'espace
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 12.5, color: "#64748B", margin: "0 0 16px" }}>
                  Connectez-vous ou créez un compte pour accepter cette invitation :
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link
                    href={`/sign-up?from=${encodeURIComponent(currentPathWithToken)}`}
                    className="lp-btn-pro"
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 10,
                      justifyContent: "center",
                      textDecoration: "none",
                      fontSize: 13.5,
                    }}
                  >
                    <UserPlus size={15} />
                    Créer un compte pour rejoindre
                  </Link>

                  <Link
                    href={`/sign-in?from=${encodeURIComponent(currentPathWithToken)}`}
                    style={{
                      width: "100%",
                      height: 42,
                      background: "#F1F5F9",
                      border: "1px solid #E2E8F0",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      color: "#334155",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <LogIn size={15} />
                    Se connecter à un compte existant
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer support */}
      <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 24 }}>
        CoFlow &bull; Collaboration d'équipe et gestion de projets
      </p>
    </div>
  );
}
