"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
  Plus, ArrowLeft, CheckCircle2, Clock, AlertTriangle,
  Calendar, Tag, Users, X, Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { fetchData, postData } from "@/lib/fetch-util";
import type { Task, Project } from "@/types";

const STATUS_COLS: { status: string; label: string; color: string; bg: string }[] = [
  { status: "To Do",       label: "À faire",      color: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)" },
  { status: "In Progress", label: "En cours",      color: "#60a5fa", bg: "rgba(59, 130, 246, 0.12)" },
  { status: "Review",      label: "En révision",   color: "#fbbf24", bg: "rgba(245, 158, 11, 0.12)" },
  { status: "Done",        label: "Terminé",       color: "#34d399", bg: "rgba(16, 185, 129, 0.12)" },
];

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  High:   { color: "#f87171", bg: "rgba(239, 68, 68, 0.15)" },
  Medium: { color: "#fbbf24", bg: "rgba(245, 158, 11, 0.15)" },
  Low:    { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" },
};

const taskSchema = z.object({
  title: z.string().min(2, "Le titre doit comporter au moins 2 caractères"),
  status: z.enum(["To Do", "In Progress", "Review", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Date d'échéance requise"),
  assignees: z.string().optional(),
});
type TaskForm = z.infer<typeof taskSchema>;

function CreateTaskModal({
  projectId,
  members,
  initialStatus,
  onClose,
}: {
  projectId: string;
  members: { user: { _id: string; name: string }; role: string }[];
  initialStatus?: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: (initialStatus as any) || "To Do",
      priority: "Medium",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: TaskForm) =>
      postData(`/tasks/${projectId}/create-task`, {
        ...d,
        assignees: d.assignees ? [d.assignees] : [],
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast.success("Tâche ajoutée avec succès !");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || "Erreur de création de la tâche"),
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.75)",
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
          maxWidth: 480,
          background: "#111118",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05) inset",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#f1f5f9", margin: 0 }}>
            Nouvelle tâche
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", padding: 6, color: "#71717a", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: 6 }}>
              Intitulé de la tâche *
            </label>
            <input
              {...register("title")}
              placeholder="ex: Rédiger le rapport d'architecture"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                border: errors.title ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                color: "#f1f5f9",
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: 6 }}>
                Statut
              </label>
              <select
                {...register("status")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#181822",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 8,
                  color: "#f1f5f9",
                  fontSize: 13,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {STATUS_COLS.map((s) => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: 6 }}>
                Priorité
              </label>
              <select
                {...register("priority")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#181822",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 8,
                  color: "#f1f5f9",
                  fontSize: 13,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="Low">Basse</option>
                <option value="Medium">Moyenne</option>
                <option value="High">Haute</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: 6 }}>
              Date d'échéance *
            </label>
            <input
              type="date"
              {...register("dueDate")}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                border: errors.dueDate ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                color: "#f1f5f9",
                fontSize: 13,
                outline: "none",
              }}
            />
            {errors.dueDate && (
              <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
                {errors.dueDate.message}
              </p>
            )}
          </div>

          {members.length > 0 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", display: "block", marginBottom: 6 }}>
                Assigner à un membre
              </label>
              <select
                {...register("assignees")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#181822",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 8,
                  color: "#f1f5f9",
                  fontSize: 13,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">— Non assignée —</option>
                {members.map((m) => (
                  <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 40,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                color: "#a1a1aa",
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
                "Ajouter la tâche"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function KanbanTaskCard({ task }: { task: Task }) {
  const p = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

  return (
    <Link href={`/tasks/${task._id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="glass-card card-hover"
        style={{
          padding: "16px",
          borderRadius: 12,
          marginBottom: 10,
          cursor: "pointer",
          background: "#13131b",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <p
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "#f1f5f9",
            margin: "0 0 10px",
            lineHeight: 1.45,
          }}
        >
          {task.title}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 999,
                background: p.bg,
                color: p.color,
              }}
            >
              {task.priority}
            </span>

            {task.dueDate && (
              <span
                style={{
                  fontSize: 11,
                  color: isOverdue ? "#ef4444" : "#71717a",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {isOverdue && <AlertTriangle size={11} />}
                {new Date(task.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>

          {Array.isArray(task.assignees) && task.assignees.length > 0 && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {(task.assignees as { _id: string; name: string }[]).slice(0, 2).map((a) => (
                <div
                  key={a._id}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))",
                    border: "1px solid rgba(124,58,237,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#e8e8f0",
                  }}
                  title={a.name}
                >
                  {a.name?.charAt(0)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [modalColumn, setModalColumn] = useState<string>("To Do");

  const { data, isLoading } = useQuery<{ project: Project; tasks: Task[] }>({
    queryKey: ["project-tasks", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
  });

  const project = data?.project;
  const tasks = data?.tasks ?? [];
  const members = (project?.members ?? []) as { user: { _id: string; name: string }; role: string }[];

  const openCreateForStatus = (status: string) => {
    setModalColumn(status);
    setShowModal(true);
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Navigation & Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
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
              padding: 0,
            }}
          >
            <ArrowLeft size={14} /> Retour à l'espace
          </button>
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
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: "#f1f5f9", margin: 0 }}>
                {isLoading ? "Chargement du projet..." : project?.title}
              </h1>
              {project?.status && (
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 999,
                    background: "rgba(59, 130, 246, 0.12)",
                    color: "#60a5fa",
                  }}
                >
                  {project.status}
                </span>
              )}
            </div>
            {project?.description && (
              <p style={{ fontSize: 13.5, color: "#71717a", margin: 0, maxWidth: 650 }}>
                {project.description}
              </p>
            )}
          </div>

          <button
            onClick={() => openCreateForStatus("To Do")}
            className="lp-btn-pro"
            style={{ height: 38, borderRadius: 8, fontSize: 13 }}
          >
            <Plus size={15} /> Nouvelle tâche
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(260px, 1fr))",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 24,
        }}
      >
        {STATUS_COLS.map(({ status, label, color, bg }) => {
          const colTasks = tasks.filter((t) => t.status === status);
          return (
            <div
              key={status}
              style={{
                background: "rgba(17, 17, 24, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: 14,
                padding: "16px 14px",
                display: "flex",
                flexDirection: "column",
                minHeight: 480,
              }}
            >
              {/* Column Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "0 4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.02em" }}>
                    {label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: bg,
                    color: color,
                    padding: "2px 8px",
                    borderRadius: 999,
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Column Content */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {isLoading ? (
                  [1, 2].map((i) => (
                    <div
                      key={i}
                      className="glass-card"
                      style={{ height: 74, borderRadius: 10, marginBottom: 8, opacity: 0.3 }}
                    />
                  ))
                ) : colTasks.length === 0 ? (
                  <div
                    style={{
                      padding: "36px 12px",
                      textAlign: "center",
                      border: "1px dashed rgba(255,255,255,0.06)",
                      borderRadius: 10,
                      color: "#52525b",
                      fontSize: 12,
                    }}
                  >
                    Aucune tâche
                  </div>
                ) : (
                  colTasks.map((t) => <KanbanTaskCard key={t._id} task={t} />)
                )}
              </div>

              {/* Add task button in column footer */}
              <button
                onClick={() => openCreateForStatus(status)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  color: "#71717a",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  cursor: "pointer",
                  marginTop: 10,
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.color = "#e2e8f0";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#71717a";
                }}
              >
                <Plus size={13} /> Ajouter une tâche
              </button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <CreateTaskModal
          projectId={projectId}
          members={members}
          initialStatus={modalColumn}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
