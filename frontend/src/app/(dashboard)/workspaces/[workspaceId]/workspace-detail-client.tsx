"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
  FolderKanban, Users, ArrowRight, BarChart2, Plus,
  CheckCircle2, Clock, Loader2, ArrowLeft, X, Mail
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { fetchData, postData } from "@/lib/fetch-util";
import type { Workspace, Project, WorkspaceStatsResponse } from "@/types";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  Planning:      { color: "#475569", bg: "#EEF1F6", label: "Planification" },
  "In Progress": { color: "#2563EB", bg: "rgba(59,130,246,0.12)", label: "En cours" },
  "On Hold":     { color: "#D97706", bg: "rgba(245,158,11,0.12)", label: "En attente" },
  Completed:     { color: "#059669", bg: "rgba(16,185,129,0.12)", label: "Terminé" },
  Cancelled:     { color: "#DC2626", bg: "rgba(239,68,68,0.12)", label: "Annulé" },
};

const projectSchema = z.object({
  title: z.string().min(2, "Le titre doit comporter au moins 2 caractères"),
  description: z.string().optional(),
  status: z.enum(["Planning", "In Progress", "On Hold", "Completed", "Cancelled"]),
  dueDate: z.string().optional(),
});
type ProjectForm = z.infer<typeof projectSchema>;

function CreateProjectModal({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: "Planning" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: ProjectForm) =>
      postData<Project>(`/projects/${workspaceId}/create-project`, d),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["workspace-projects", workspaceId] });
      toast.success(`Projet "${p.title}" créé avec succès !`);
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || "Erreur de création du projet"),
  });

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
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.15)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#1E293B", margin: 0 }}>
            Nouveau projet
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", padding: 6, color: "#94A3B8", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Titre du projet *
            </label>
            <input
              {...register("title")}
              placeholder="ex: Refonte Marketing 2026"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#F8FAFC",
                border: errors.title ? "1px solid #ef4444" : "1px solid #E2E8F0",
                borderRadius: 8,
                color: "#1E293B",
                fontSize: 13.5,
                outline: "none",
              }}
            />
            {errors.title && (
              <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Objectifs principaux et périmètre..."
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                color: "#1E293B",
                fontSize: 13.5,
                outline: "none",
                resize: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                Statut
              </label>
              <select
                {...register("status")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  color: "#1E293B",
                  fontSize: 13,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                Échéance
              </label>
              <input
                type="date"
                {...register("dueDate")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  color: "#1E293B",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
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
                  Création...
                </>
              ) : (
                "Créer le projet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: number | string; icon: React.ElementType; color: string; bg: string }) {
  return (
    <div className="glass-card card-hover" style={{ padding: "18px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#1E293B", letterSpacing: "-0.03em" }}>{value}</p>
        <p style={{ fontSize: 11.5, color: "#64748B", margin: 0 }}>{label}</p>
      </div>
    </div>
  );
}

export default function WorkspaceDetailClient({ workspaceId }: { workspaceId: string }) {
  const [activeTab, setActiveTab] = useState<"projects" | "members">("projects");
  const [showProjectModal, setShowProjectModal] = useState(false);

  const { data, isLoading } = useQuery<{ projects: Project[]; workspace: Workspace }>({
    queryKey: ["workspace-projects", workspaceId],
    queryFn: () => fetchData(`/workspaces/${workspaceId}/projects`),
  });

  const { data: stats } = useQuery<WorkspaceStatsResponse>({
    queryKey: ["workspace-stats", workspaceId],
    queryFn: () => fetchData(`/workspaces/${workspaceId}/stats`),
  });

  const workspace = data?.workspace;
  const projects = data?.projects ?? [];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Link
            href="/workspaces"
            style={{
              color: "#64748B",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} /> Tous les workspaces
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {workspace && (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: workspace.color || "#4D9972",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 18,
                  flexShrink: 0,
                  boxShadow: `0 4px 14px ${(workspace.color || "#4D9972")}33`,
                }}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: "#1E293B", margin: 0 }}>
                {isLoading ? "Chargement…" : workspace?.name}
              </h1>
              {workspace?.description && (
                <p style={{ fontSize: 13.5, color: "#64748B", margin: "4px 0 0" }}>
                  {workspace.description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowProjectModal(true)}
            className="lp-btn-pro"
            style={{ height: 40, borderRadius: 8, fontSize: 13 }}
          >
            <Plus size={15} /> Nouveau projet
          </button>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
          <StatCard label="Projets" value={stats.stats.totalProjects} icon={FolderKanban} color="#334155" bg="rgba(51,65,85,0.10)" />
          <StatCard label="Tâches actives" value={stats.stats.totalTasks} icon={CheckCircle2} color="#2563EB" bg="rgba(59,130,246,0.12)" />
          <StatCard label="En cours" value={stats.stats.totalProjectInProgress} icon={Clock} color="#D97706" bg="rgba(245,158,11,0.12)" />
          <StatCard label="Membres" value={workspace?.members?.length ?? 1} icon={Users} color="#059669" bg="rgba(16,185,129,0.12)" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, padding: "4px", background: "#EEF1F6", borderRadius: 8, width: "fit-content" }}>
        <button
          onClick={() => setActiveTab("projects")}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: activeTab === "projects" ? 700 : 500,
            color: activeTab === "projects" ? "#1E293B" : "#64748B",
            background: activeTab === "projects" ? "#FFFFFF" : "transparent",
            border: "none",
            borderRadius: 6,
            boxShadow: activeTab === "projects" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <FolderKanban size={14} /> Projets ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab("members")}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: activeTab === "members" ? 700 : 500,
            color: activeTab === "members" ? "#1E293B" : "#64748B",
            background: activeTab === "members" ? "#FFFFFF" : "transparent",
            border: "none",
            borderRadius: 6,
            boxShadow: activeTab === "members" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Users size={14} /> Membres ({workspace?.members?.length ?? 0})
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card" style={{ height: 160, borderRadius: 14, opacity: 0.3 }} />
            ))}
          </div>
        ) : !projects.length ? (
          <div
            className="glass-card"
            style={{
              textAlign: "center",
              padding: "70px 24px",
              borderRadius: 16,
              border: "1px dashed #CBD5E1",
            }}
          >
            <FolderKanban size={40} color="#94A3B8" style={{ margin: "0 auto 12px" }} />
            <p style={{ color: "#1E293B", fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>
              Aucun projet dans cet espace
            </p>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 18px" }}>
              Lancez votre première initiative pour collaborer avec votre équipe.
            </p>
            <button
              onClick={() => setShowProjectModal(true)}
              className="lp-btn-nav"
              style={{ margin: "0 auto" }}
            >
              <Plus size={14} /> Créer un projet
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {projects.map((p) => {
              const sc = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.Planning;
              const tasksArr = Array.isArray(p.tasks) ? p.tasks : [];
              return (
                <Link key={p._id} href={`/projects/${p._id}`} style={{ textDecoration: "none" }}>
                  <div
                    className="glass-card card-hover"
                    style={{
                      padding: "22px",
                      borderRadius: 14,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 160,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 999,
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {sc.label}
                        </span>
                        <ArrowRight size={14} color="#94A3B8" />
                      </div>

                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          letterSpacing: "-0.02em",
                          color: "#1E293B",
                          margin: "0 0 6px",
                        }}
                      >
                        {p.title}
                      </h3>
                      {p.description && (
                        <p
                          style={{
                            fontSize: 12.5,
                            color: "#64748B",
                            margin: 0,
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        fontSize: 12,
                        color: "#64748B",
                        paddingTop: 14,
                        marginTop: 14,
                        borderTop: "1px solid #F1F5F9",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <CheckCircle2 size={13} color="#2563EB" />
                        {tasksArr.length} tâche{tasksArr.length !== 1 ? "s" : ""}
                      </span>
                      {p.dueDate && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={13} />
                          {new Date(p.dueDate).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {workspace?.members?.map((m) => {
            const u = m.user as { _id: string; name: string; email: string; profilePicture?: string };
            return (
              <div
                key={u._id}
                className="glass-card"
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "#EEF1F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#334155",
                      flexShrink: 0,
                    }}
                  >
                    {u.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1E293B", margin: 0 }}>
                      {u.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>
                      {u.email}
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: "rgba(77, 153, 114, 0.12)",
                    color: "#3B805C",
                    textTransform: "capitalize",
                  }}
                >
                  {m.role || "Membre"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {showProjectModal && (
        <CreateProjectModal
          workspaceId={workspaceId}
          onClose={() => setShowProjectModal(false)}
        />
      )}
    </div>
  );
}

