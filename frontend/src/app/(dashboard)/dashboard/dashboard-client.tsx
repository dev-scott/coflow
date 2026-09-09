"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FolderKanban, CheckSquare, Clock, Users, ArrowUpRight,
  TrendingUp, Plus, Sparkles, CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { fetchData } from "@/lib/fetch-util";
import type { Workspace, Task } from "@/types";

export default function DashboardClient() {
  const { user } = useAuth();

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
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", color: "#f1f5f9", margin: 0 }}>
              Bonjour, {user?.name?.split(" ")[0] ?? "Collaborateur"} 👋
            </h1>
          </div>
          <p style={{ fontSize: 14, color: "#71717a", margin: 0 }}>
            Voici le résumé en direct de vos livrables et de vos espaces collaboratifs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              fontSize: 12.5,
              color: "#a1a1aa",
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
            <span style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa" }}>Tâches actives</span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(59, 130, 246, 0.12)",
                color: "#60a5fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
              {tasksLoading ? "—" : activeTasks.length}
            </span>
            <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>
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
            <span style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa" }}>Taux de complétion</span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(16, 185, 129, 0.12)",
                color: "#34d399",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
              {tasksLoading ? "—" : `${completionRate}%`}
            </span>
            <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>
              {completedTasks.length} terminées
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
            <div
              style={{
                width: `${completionRate}%`,
                height: "100%",
                borderRadius: 2,
                background: "linear-gradient(90deg, #10b981, #06b6d4)",
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
            <span style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa" }}>Espaces gérés</span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(124, 58, 237, 0.12)",
                color: "#a78bfa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderKanban size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
              {wsLoading ? "—" : workspaces?.length ?? 0}
            </span>
            <span style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 600 }}>
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
            <span style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa" }}>Collaborateurs</span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(245, 158, 11, 0.12)",
                color: "#fbbf24",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
              {wsLoading ? "—" : totalMembers}
            </span>
            <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>
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
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>
                Mes tâches prioritaires
              </h2>
              <p style={{ fontSize: 12.5, color: "#71717a", margin: 0 }}>
                Livrables assignés nécessitant votre attention
              </p>
            </div>
            <Link
              href="/my-tasks"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#a78bfa",
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
                <div key={i} style={{ height: 50, borderRadius: 8, background: "rgba(255,255,255,0.03)" }} />
              ))}
            </div>
          ) : activeTasks.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: "0 auto 12px", opacity: 0.8 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: "0 0 4px" }}>
                Vous êtes à jour !
              </p>
              <p style={{ fontSize: 12.5, color: "#71717a", margin: 0 }}>
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
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
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
                          background: t.status === "In Progress" ? "#3b82f6" : "#64748b",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#e2e8f0",
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
                              ? "rgba(239, 68, 68, 0.15)"
                              : t.priority === "Medium"
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(100, 116, 139, 0.15)",
                          color:
                            t.priority === "High"
                              ? "#fca5a5"
                              : t.priority === "Medium"
                              ? "#fcd34d"
                              : "#94a3b8",
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
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" }}>
                Mes Espaces
              </h2>
              <p style={{ fontSize: 12.5, color: "#71717a", margin: 0 }}>
                Environnements actifs
              </p>
            </div>
            <Link
              href="/workspaces"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#a78bfa",
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
                <div key={i} style={{ height: 60, borderRadius: 10, background: "rgba(255,255,255,0.03)" }} />
              ))}
            </div>
          ) : !workspaces?.length ? (
            <div style={{ padding: "30px 16px", textAlign: "center" }}>
              <FolderKanban size={32} color="#52525b" style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 13, color: "#71717a", margin: "0 0 12px" }}>
                Aucun espace pour le moment.
              </p>
              <Link href="/workspaces" className="lp-btn-nav">
                + Nouveau workspace
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
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
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
                          opacity: 0.85,
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
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#f1f5f9", margin: 0 }}>
                          {ws.name}
                        </p>
                        <p style={{ fontSize: 11.5, color: "#71717a", margin: "2px 0 0" }}>
                          {ws.members?.length || 1} membre(s)
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight size={15} color="#52525b" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
