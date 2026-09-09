"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft, CheckCircle2, Circle, Eye, EyeOff, Send,
  AlertTriangle, Calendar, Tag, Plus, Loader2, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { fetchData, postData, putData } from "@/lib/fetch-util";
import type { Task, Comment, ActivityLog } from "@/types";

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  High:   { color: "#f87171", bg: "rgba(239, 68, 68, 0.15)" },
  Medium: { color: "#fbbf24", bg: "rgba(245, 158, 11, 0.15)" },
  Low:    { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "To Do":       { label: "À faire",      color: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)" },
  "In Progress": { label: "En cours",      color: "#60a5fa", bg: "rgba(59, 130, 246, 0.12)" },
  "Review":      { label: "En révision",   color: "#fbbf24", bg: "rgba(245, 158, 11, 0.12)" },
  "Done":        { label: "Terminée",     color: "#34d399", bg: "rgba(16, 185, 129, 0.12)" },
};

export default function TaskDetailClient({ taskId }: { taskId: string }) {
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const { data, isLoading } = useQuery<{ task: Task; project: unknown }>({
    queryKey: ["task", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}`),
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["task-comments", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}/comments`),
  });

  const { data: activity } = useQuery<ActivityLog[]>({
    queryKey: ["task-activity", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}/activity`),
  });

  const task = data?.task;

  // Change task status directly
  const { mutate: updateStatus } = useMutation({
    mutationFn: (newStatus: string) => putData(`/tasks/${taskId}`, { status: newStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      toast.success("Statut de la tâche mis à jour !");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur de mise à jour"),
  });

  // Toggle subtask
  const { mutate: toggleSubtask } = useMutation({
    mutationFn: ({ subId, completed }: { subId: string; completed: boolean }) =>
      putData(`/tasks/${taskId}/update-subtask/${subId}`, { completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task", taskId] }),
    onError: (err: Error) => toast.error(err.message),
  });

  // Add subtask
  const { mutate: addSubtask, isPending: addingSubtask } = useMutation({
    mutationFn: (title: string) => postData(`/tasks/${taskId}/subtasks`, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      setNewSubtaskTitle("");
      toast.success("Sous-tâche ajoutée !");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur d'ajout de sous-tâche"),
  });

  // Toggle watch
  const { mutate: toggleWatch } = useMutation({
    mutationFn: () => postData(`/tasks/${taskId}/watch`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      toast.success("Préférences de notification mises à jour");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Archive
  const { mutate: archive } = useMutation({
    mutationFn: () => postData(`/tasks/${taskId}/achieved`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      toast.success(task?.isArchived ? "Tâche restaurée" : "Tâche archivée dans les Réalisés");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Add comment
  const { mutate: sendComment, isPending: sendingComment } = useMutation({
    mutationFn: () => postData(`/tasks/${taskId}/add-comment`, { text: comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task-comments", taskId] });
      setComment("");
      toast.success("Commentaire publié");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const assignees = (task?.assignees ?? []) as { _id: string; name: string; profilePicture?: string }[];
  const subtasks = task?.subtasks ?? [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  const sectionTitle = (text: string) => (
    <h3 style={{ fontSize: 11.5, fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
      {text}
    </h3>
  );

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card" style={{ height: 80, borderRadius: 14, opacity: 0.3 }} />
        ))}
      </div>
    );
  }

  if (!task) {
    return (
      <div className="glass-card" style={{ padding: 40, textAlign: "center", borderRadius: 14 }}>
        <p style={{ color: "#71717a", fontSize: 14 }}>Tâche introuvable ou supprimée.</p>
        <button
          onClick={() => window.history.back()}
          className="lp-btn-nav"
          style={{ marginTop: 14 }}
        >
          ← Retour
        </button>
      </div>
    );
  }

  const s = STATUS_CONFIG[task.status] ?? STATUS_CONFIG["To Do"];
  const p = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Medium;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#71717a",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 20,
          padding: 0,
        }}
      >
        <ArrowLeft size={14} /> Retour au projet
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Main Card */}
          <div className="glass-card" style={{ padding: "28px", borderRadius: 14 }}>
            {/* Status Switcher & Badges */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: s.bg,
                    color: s.color,
                  }}
                >
                  {s.label}
                </span>

                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: p.bg,
                    color: p.color,
                  }}
                >
                  Priorité {task.priority}
                </span>

                {task.isArchived && (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#34d399",
                    }}
                  >
                    ✓ Réalisée / Archivée
                  </span>
                )}
              </div>

              {/* Status Selector Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#71717a" }}>Changer :</span>
                <select
                  value={task.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.10)",
                    color: "#f1f5f9",
                    padding: "5px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <option key={key} value={key} style={{ background: "#111", color: "#fff" }}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#f1f5f9", margin: "0 0 12px" }}>
              {task.title}
            </h1>

            {task.description ? (
              <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
                {task.description}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: "#52525b", fontStyle: "italic", margin: 0 }}>
                Aucune description fournie pour cette tâche.
              </p>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="glass-card" style={{ padding: "24px 28px", borderRadius: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              {sectionTitle(`Sous-tâches (${completedSubtasks}/${subtasks.length})`)}
              <span style={{ fontSize: 12, color: "#71717a" }}>
                {subtasks.length > 0 ? `${Math.round((completedSubtasks / subtasks.length) * 100)}% complété` : ""}
              </span>
            </div>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, marginBottom: 18, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 999,
                    width: `${subtasks.length ? (completedSubtasks / subtasks.length) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}

            {/* Subtasks list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
              {subtasks.map((s) => (
                <button
                  key={s._id}
                  onClick={() => toggleSubtask({ subId: s._id, completed: !s.completed })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(255,255,255,0.015)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    padding: "10px 14px",
                    borderRadius: 8,
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}
                >
                  {s.completed ? (
                    <CheckCircle2 size={18} color="#10b981" />
                  ) : (
                    <Circle size={18} color="#52525b" />
                  )}
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: s.completed ? "#71717a" : "#f1f5f9",
                      textDecoration: s.completed ? "line-through" : "none",
                    }}
                  >
                    {s.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Add Subtask Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newSubtaskTitle.trim()) addSubtask(newSubtaskTitle.trim());
              }}
              style={{ display: "flex", gap: 8 }}
            >
              <input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Ajouter une étape ou sous-tâche..."
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "#f1f5f9",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim() || addingSubtask}
                className="lp-btn-nav"
                style={{ height: 38 }}
              >
                <Plus size={14} /> Ajouter
              </button>
            </form>
          </div>

          {/* Comments Section */}
          <div className="glass-card" style={{ padding: "24px 28px", borderRadius: 14 }}>
            {sectionTitle("Commentaires & Échanges")}

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {!comments?.length && (
                <p style={{ fontSize: 13, color: "#52525b", fontStyle: "italic", margin: 0 }}>
                  Aucun commentaire. Soyez le premier à laisser une note sur cette tâche.
                </p>
              )}
              {comments?.map((c) => {
                const author = c.author as { _id: string; name: string };
                return (
                  <div
                    key={c._id}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#a78bfa",
                        flexShrink: 0,
                      }}
                    >
                      {author?.name?.charAt(0) ?? "U"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{author?.name ?? "Membre"}</span>
                        <span style={{ fontSize: 11, color: "#52525b" }}>
                          {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <p style={{ fontSize: 13.5, color: "#a1a1aa", margin: 0, lineHeight: 1.6 }}>{c.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comment Input */}
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && comment.trim() && !sendingComment) {
                    sendComment();
                  }
                }}
                placeholder="Écrire un message d'équipe..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "#f1f5f9",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={() => comment.trim() && sendComment()}
                disabled={!comment.trim() || sendingComment}
                className="lp-btn-pro"
                style={{ height: 42, borderRadius: 8, padding: "0 16px" }}
              >
                {sendingComment ? <Loader2 size={15} className="animate-spin-slow" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Metadata Card */}
          <div className="glass-card" style={{ padding: "20px 22px", borderRadius: 14 }}>
            {sectionTitle("Informations clés")}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {task.dueDate && (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Calendar size={16} color="#71717a" />
                  <div>
                    <p style={{ fontSize: 10.5, color: "#71717a", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                      Échéance
                    </p>
                    <p style={{ fontSize: 13, color: "#f1f5f9", margin: "2px 0 0", fontWeight: 600 }}>
                      {new Date(task.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Tag size={16} color="#71717a" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 10.5, color: "#71717a", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 6 }}>
                      Tags & Filtres
                    </p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "rgba(255,255,255,0.06)",
                            color: "#c4b5fd",
                            fontWeight: 500,
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignees Card */}
          {assignees.length > 0 && (
            <div className="glass-card" style={{ padding: "20px 22px", borderRadius: 14 }}>
              {sectionTitle("Membres assignés")}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {assignees.map((a) => (
                  <div key={a._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(124,58,237,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#a78bfa",
                      }}
                    >
                      {a.name?.charAt(0)}
                    </div>
                    <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 500 }}>{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="glass-card" style={{ padding: "20px 22px", borderRadius: 14 }}>
            {sectionTitle("Actions rapides")}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => toggleWatch()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 8,
                  color: "#a1a1aa",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <Eye size={14} /> Suivre les modifications
              </button>

              <button
                onClick={() => archive()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 12px",
                  background: task.isArchived ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${task.isArchived ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 8,
                  color: task.isArchived ? "#34d399" : "#a1a1aa",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <CheckCircle2 size={14} />
                {task.isArchived ? "Restaurer dans le projet" : "Marquer comme réalisée"}
              </button>
            </div>
          </div>

          {/* Activity Log Card */}
          {activity && activity.length > 0 && (
            <div className="glass-card" style={{ padding: "20px 22px", borderRadius: 14 }}>
              {sectionTitle("Historique d'activité")}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activity.slice(0, 5).map((a) => {
                  const u = a.user as { name: string };
                  return (
                    <div key={a._id} style={{ display: "flex", gap: 8 }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#7c3aed",
                          marginTop: 6,
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <p style={{ fontSize: 12, color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>
                          <strong style={{ color: "#f1f5f9" }}>{u?.name ?? "Système"}</strong>{" "}
                          {(a.details as { description?: string })?.description ?? a.action}
                        </p>
                        <p style={{ fontSize: 10.5, color: "#52525b", margin: "2px 0 0" }}>
                          {new Date(a.createdAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
