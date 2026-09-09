"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Star, TrendingUp, Calendar, ArrowUpRight, FolderKanban } from "lucide-react";
import Link from "next/link";
import { fetchData } from "@/lib/fetch-util";
import type { Task } from "@/types";

export default function AchievedClient() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["my-tasks"],
    queryFn: () => fetchData("/tasks/my-tasks"),
  });

  const allTasks = tasks ?? [];
  const completedTasks = allTasks.filter((t) => t.status === "Done");
  const completionRate = allTasks.length > 0 
    ? Math.round((completedTasks.length / allTasks.length) * 100) 
    : 0;

  const stats = [
    {
      label: "Tâches accomplies",
      value: completedTasks.length,
      icon: CheckCircle2,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.12)",
    },
    {
      label: "Taux de complétion",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.12)",
    },
    {
      label: "Total assignées",
      value: allTasks.length,
      icon: Star,
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.12)",
    },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(16, 185, 129, 0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#10b981",
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
              Réalisés & Accomplissements
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: "4px 0 0" }}>
              Archive de vos tâches menées à bien et projets terminés
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card" style={{ padding: "20px 24px", borderRadius: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: s.bgColor, color: s.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14,
              }}>
                <Icon size={18} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "var(--foreground)" }}>
                {isLoading ? "—" : s.value}
              </p>
              <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", margin: "4px 0 0" }}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="glass-card" style={{ borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>
            Tâches terminées ({completedTasks.length})
          </h2>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Classées par date d'accomplissement
          </span>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 56, borderRadius: 10, background: "rgba(255,255,255,0.03)" }} />
            ))}
          </div>
        ) : completedTasks.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 12,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.08)", color: "#10b981",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <CheckCircle2 size={26} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>
              Aucune tâche terminée pour le moment
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", maxWidth: 360, margin: "0 auto 20px" }}>
              Lorsque vous marquez des tâches comme "Done" dans vos projets, elles apparaîtront ici avec vos statistiques de succès.
            </p>
            <Link
              href="/my-tasks"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 8,
                background: "rgba(255,255,255,0.06)", color: "var(--foreground)",
                fontSize: 13, fontWeight: 500, textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Voir mes tâches en cours <ArrowUpRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {completedTasks.map((task) => (
              <Link
                key={task._id}
                href={`/tasks/${task._id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="card-hover"
                  style={{
                    padding: "16px 20px", borderRadius: 10,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.15)", color: "#10b981",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 600, color: "var(--foreground)",
                        margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p style={{
                          fontSize: 12, color: "var(--muted-foreground)",
                          margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    {task.updatedAt && (
                      <span style={{ fontSize: 11.5, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={13} />
                        {new Date(task.updatedAt).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                      background: "rgba(16, 185, 129, 0.15)", color: "#10b981",
                    }}>
                      Terminée
                    </span>
                    <ArrowUpRight size={15} color="#555" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
