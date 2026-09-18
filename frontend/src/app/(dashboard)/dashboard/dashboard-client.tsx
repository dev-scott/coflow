"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  FolderKanban, CheckSquare, Clock, Users, ArrowUpRight,
  TrendingUp, Plus, Sparkles, CheckCircle2, AlertCircle, ChevronRight, Zap, Crown
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { usePlan } from "@/hooks/use-plan";
import { UpgradeModal } from "@/components/upgrade-modal";
import { fetchData } from "@/lib/fetch-util";
import type { Workspace, Task } from "@/types";

export default function DashboardClient() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const {
    isPro,
    isProPaid,
    isTrialActive,
    isTrialExpired,
    daysLeftInTrial,
    currentTrialDay,
    trialProgressPercent,
  } = usePlan();

  // Détection du retour de paiement réussi (Notch Pay ou Sandbox)
  useEffect(() => {
    const payment = searchParams.get("payment");
    const ref = searchParams.get("ref");
    if (payment === "success" || payment === "sandbox") {
      toast.success("🎉 Félicitations ! Votre abonnement Pro a été activé avec succès.");
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: ["plan-status"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams, queryClient]);

  const { data: workspaces, isLoading: wsLoading } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: () => fetchData("/workspaces"),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["my-tasks"],
    queryFn: () => fetchData("/tasks/my-tasks"),
  });

  const allTasks = tasks ?? [];
  const todoTasks = allTasks.filter((t) => t.status === "To Do");
  const inProgressTasks = allTasks.filter((t) => t.status === "In Progress");
  const completedTasks = allTasks.filter((t) => t.status === "Done");
  const activeTasks = [...inProgressTasks, ...todoTasks];

  const completionRate = allTasks.length > 0
    ? Math.round((completedTasks.length / allTasks.length) * 100)
    : 0;

  const totalMembers = (workspaces ?? []).reduce(
    (acc, ws) => acc + (ws.members?.length || 1),
    0
  );

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* ── HEADER GREETING ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", color: "#1E293B", margin: 0 }}>
              Bonjour, {user?.name?.split(" ")[0] ?? "Collaborateur"} 👋
            </h1>
          </div>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
            Voici le résumé en direct de vos livrables et de vos espaces collaboratifs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              background: "#EEF1F6",
              border: "1px solid #E2E8F0",
              fontSize: 12.5,
              fontWeight: 500,
              color: "#475569",
              textTransform: "capitalize",
            }}
          >
            {currentDate}
          </div>
          <Link
            href="/workspaces"
            className="lp-btn-pro"
            style={{ borderRadius: 8, height: 38, textDecoration: "none" }}
          >
            <Plus size={15} />
            Créer un espace
          </Link>
        </div>
      </div>

      {/* ── BANNIÈRE CONTEXTUELLE D'ESSAI PRO OU EXPIRATION ── */}
      {isTrialActive && (
        <div
          style={{
            marginBottom: 24,
            padding: "14px 20px",
            borderRadius: 14,
            background: "linear-gradient(135deg, rgba(59, 128, 92, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)",
            border: "1px solid rgba(59, 128, 92, 0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(59, 128, 92, 0.14)",
                color: "#2D6A4F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Zap size={18} fill="#3B805C" />
            </div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", margin: "0 0 2px" }}>
                Essai Pro Actif · Jour {currentTrialDay} sur 14 ({daysLeftInTrial} jour{daysLeftInTrial > 1 ? "s" : ""} restant{daysLeftInTrial > 1 ? "s" : ""})
              </p>
              <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
                Vos fonctionnalités Pro illimitées sont actives. Choisissez dès maintenant votre abonnement pour continuer sans interruption.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              background: "#2D6A4F",
              color: "#FFFFFF",
              fontSize: 12.5,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              transition: "background 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#24553F")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#2D6A4F")}
          >
            <span>Passer à l'abonnement Pro</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {isTrialExpired && (
        <div
          style={{
            marginBottom: 24,
            padding: "14px 20px",
            borderRadius: 14,
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(245, 158, 11, 0.16)",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#92400E", margin: "0 0 2px" }}>
                Votre période d'essai de 14 jours est terminée
              </p>
              <p style={{ fontSize: 12, color: "#B45309", margin: 0 }}>
                Vos projets et espaces sont en sécurité. Choisissez votre formule pour débloquer les collaborateurs illimités.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              background: "#D97706",
              color: "#FFFFFF",
              fontSize: 12.5,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <span>Réactiver le Plan Pro</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── BENTO KPI CARDS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {/* KPI 1: Tâches actives */}
        <div
          className="glass-card card-hover"
          style={{ padding: "20px 22px", borderRadius: 14, position: "relative", overflow: "hidden" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>Tâches actives</span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(59, 130, 246, 0.12)",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#1E293B" }}>
              {tasksLoading ? "—" : activeTasks.length}
            </span>
            <span style={{ fontSize: 12, color: "#2563EB", fontWeight: 600 }}>
              {inProgressTasks.length} en cours
            </span>
          </div>
        </div>

        {/* KPI 2: Taux de complétion */}
        <div
          className="glass-card card-hover"
          style={{ padding: "20px 22px", borderRadius: 14, position: "relative", overflow: "hidden" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>Taux de complétion</span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(77, 153, 114, 0.15)",
                color: "#3B805C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#1E293B" }}>
              {tasksLoading ? "—" : `${completionRate}%`}
            </span>
            <span style={{ fontSize: 12, color: "#3B805C", fontWeight: 600 }}>
              {completedTasks.length} terminées
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ width: "100%", height: 5, borderRadius: 3, background: "#EEF1F6" }}>
            <div
              style={{
                width: `${completionRate}%`,
                height: "100%",
                borderRadius: 3,
                background: "linear-gradient(90deg, #3B805C, #4D9972)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* KPI 3: Espaces de travail */}
        <div
          className="glass-card card-hover"
          style={{ padding: "20px 22px", borderRadius: 14, position: "relative", overflow: "hidden" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>Espaces gérés</span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(51, 65, 85, 0.10)",
                color: "#334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderKanban size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#1E293B" }}>
              {wsLoading ? "—" : workspaces?.length ?? 0}
            </span>
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>
              Workspaces actifs
            </span>
          </div>
        </div>

        {/* KPI 4: Collaborateurs */}
        <div
          className="glass-card card-hover"
          style={{ padding: "20px 22px", borderRadius: 14, position: "relative", overflow: "hidden" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>Collaborateurs</span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(245, 158, 11, 0.12)",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#1E293B" }}>
              {wsLoading ? "—" : totalMembers}
            </span>
            <span style={{ fontSize: 12, color: "#D97706", fontWeight: 600 }}>
              Membres d'équipe
            </span>
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN MAIN SECTIONS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Left Column: Tâches prioritaires */}
        <div className="glass-card" style={{ borderRadius: 16, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", margin: "0 0 4px" }}>
                Mes tâches prioritaires
              </h2>
              <p style={{ fontSize: 12.5, color: "#64748B", margin: 0 }}>
                Livrables assignés nécessitant votre attention
              </p>
            </div>
            <Link
              href="/my-tasks"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#3B805C",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Tout voir <ChevronRight size={14} />
            </Link>
          </div>

          {tasksLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 50, borderRadius: 8, background: "#F1F5F9" }} />
              ))}
            </div>
          ) : activeTasks.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <CheckCircle2 size={36} color="#4D9972" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1E293B", margin: "0 0 4px" }}>
                Vous êtes à jour !
              </p>
              <p style={{ fontSize: 12.5, color: "#64748B", margin: 0 }}>
                Aucune tâche en attente dans vos projets actuels.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeTasks.slice(0, 5).map((t) => (
                <Link
                  key={t._id}
                  href={`/tasks/${t._id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card-hover"
                    style={{
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: t.status === "In Progress" ? "#3b82f6" : "#94A3B8",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1E293B",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.title}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background:
                            t.priority === "High"
                              ? "rgba(239, 68, 68, 0.12)"
                              : t.priority === "Medium"
                              ? "rgba(245, 158, 11, 0.12)"
                              : "rgba(100, 116, 139, 0.12)",
                          color:
                            t.priority === "High"
                              ? "#DC2626"
                              : t.priority === "Medium"
                              ? "#D97706"
                              : "#475569",
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Mes Espaces de travail */}
        <div className="glass-card" style={{ borderRadius: 16, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", margin: "0 0 4px" }}>
                Mes Espaces
              </h2>
              <p style={{ fontSize: 12.5, color: "#64748B", margin: 0 }}>
                Environnements actifs
              </p>
            </div>
            <Link
              href="/workspaces"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#3B805C",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Gérer <ChevronRight size={14} />
            </Link>
          </div>

          {wsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2].map((i) => (
                <div key={i} style={{ height: 60, borderRadius: 10, background: "#F1F5F9" }} />
              ))}
            </div>
          ) : !workspaces?.length ? (
            <div style={{ padding: "30px 16px", textAlign: "center" }}>
              <FolderKanban size={32} color="#94A3B8" style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 12px" }}>
                Aucun espace pour le moment.
              </p>
              <Link href="/workspaces" className="lp-btn-nav">
                + Nouvel espace
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {workspaces.map((ws) => (
                <Link
                  key={ws._id}
                  href={`/workspaces/${ws._id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card-hover"
                    style={{
                      padding: "14px 16px",
                      borderRadius: 10,
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: ws.color || "#3b82f6",
                          opacity: 0.9,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#fff",
                        }}
                      >
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#1E293B", margin: 0 }}>
                          {ws.name}
                        </p>
                        <p style={{ fontSize: 11.5, color: "#64748B", margin: "2px 0 0" }}>
                          {ws.members?.length || 1} membre(s)
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight size={15} color="#94A3B8" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
