"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  Plus, ArrowLeft, CheckCircle2, Clock, AlertTriangle,
  Calendar, Tag, Users, X, Loader2, Search, Download,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { fetchData, postData, putData } from "@/lib/fetch-util";
import { trackTask, trackEngagement } from "@/lib/analytics";
import type { Task, Project } from "@/types";

const STATUS_COLS: { status: string; label: string; color: string; bg: string }[] = [
  { status: "To Do",       label: "À faire",      color: "#475569", bg: "#E2E8F0" },
  { status: "In Progress", label: "En cours",      color: "#2563EB", bg: "rgba(59, 130, 246, 0.12)" },
  { status: "Review",      label: "En révision",   color: "#D97706", bg: "rgba(245, 158, 11, 0.12)" },
  { status: "Done",        label: "Terminé",       color: "#059669", bg: "rgba(16, 185, 129, 0.12)" },
];

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  High:   { color: "#DC2626", bg: "rgba(239, 68, 68, 0.12)" },
  Medium: { color: "#D97706", bg: "rgba(245, 158, 11, 0.12)" },
  Low:    { color: "#475569", bg: "rgba(100, 116, 139, 0.12)" },
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
      status: (initialStatus as "To Do" | "In Progress" | "Review" | "Done") || "To Do",
      priority: "Medium",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: TaskForm) =>
      postData<Task>(`/tasks/${projectId}/create-task`, {
        ...d,
        assignees: d.assignees ? [d.assignees] : [],
      }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      toast.success(`Tâche "${t.title}" ajoutée !`);
      trackTask("create", {
        taskId: t._id,
        taskTitle: t.title,
        toStatus: t.status,
        priority: t.priority,
        projectId,
      });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || "Erreur de création"),
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
          maxWidth: 480,
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
            Nouvelle tâche
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
              Intitulé de la tâche *
            </label>
            <input
              {...register("title")}
              placeholder="ex: Rédiger le rapport d'architecture"
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
                {STATUS_COLS.map((s) => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                Priorité
              </label>
              <select
                {...register("priority")}
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
                <option value="Low">Basse</option>
                <option value="Medium">Moyenne</option>
                <option value="High">Haute</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
              Date d'échéance *
            </label>
            <input
              type="date"
              {...register("dueDate")}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#F8FAFC",
                border: errors.dueDate ? "1px solid #ef4444" : "1px solid #E2E8F0",
                borderRadius: 8,
                color: "#1E293B",
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
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                Assigner à un membre
              </label>
              <select
                {...register("assignees")}
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
                "Ajouter la tâche"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function KanbanTaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const qc = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const p = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

  const handleQuickStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus === task.status) return;

    setIsUpdating(true);
    try {
      await putData(`/tasks/${task._id}`, { status: newStatus });
      toast.success(`Statut mis à jour : ${newStatus}`);
      trackTask("status_change", {
        taskId: task._id,
        taskTitle: task.title,
        fromStatus: task.status,
        toStatus: newStatus,
        projectId,
      });
      qc.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    } catch {
      toast.error("Impossible de modifier le statut");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Link href={`/tasks/${task._id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="glass-card card-hover"
        style={{
          padding: "15px",
          borderRadius: 12,
          marginBottom: 10,
          cursor: "pointer",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
          transition: "all 0.15s ease",
        }}
      >
        <p
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "#1E293B",
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
                  color: isOverdue ? "#DC2626" : "#64748B",
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
                    background: "#EEF1F6",
                    border: "1px solid #CBD5E1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#334155",
                  }}
                  title={a.name}
                >
                  {a.name?.charAt(0)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick status selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px solid #F1F5F9",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <span style={{ fontSize: 10.5, color: "#94A3B8", fontWeight: 500 }}>
            {isUpdating ? "Mise à jour..." : "Statut :"}
          </span>
          <select
            value={task.status}
            disabled={isUpdating}
            onChange={handleQuickStatusChange}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 6,
              background: "#F8FAFC",
              border: "1px solid #CBD5E1",
              color: "#334155",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="To Do">À faire</option>
            <option value="In Progress">En cours</option>
            <option value="Review">En révision</option>
            <option value="Done">Terminé</option>
          </select>
        </div>
      </div>
    </Link>
  );
}

export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [modalColumn, setModalColumn] = useState<string>("To Do");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");

  const { data, isLoading } = useQuery<{
    project: Project;
    tasks: Task[];
    workspaceMembers?: { user: { _id: string; name: string }; role: string }[];
  }>({
    queryKey: ["project-tasks", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
  });

  const project = data?.project;
  const tasks = data?.tasks ?? [];
  const projectMembers = (project?.members ?? []) as { user: { _id: string; name: string }; role: string }[];
  const workspaceMembers = (data?.workspaceMembers ?? []) as { user: { _id: string; name: string }; role: string }[];

  // Filtrage réactif des tâches par recherche et priorité
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesPriority =
        selectedPriority === "ALL" || t.priority === selectedPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, selectedPriority]);

  // Exportation CSV
  const exportTasksCSV = () => {
    if (tasks.length === 0) {
      toast.error("Aucune tâche à exporter");
      return;
    }
    const headers = ["ID", "Titre", "Statut", "Priorité", "Échéance", "Assignés"];
    const rows = tasks.map((t) => [
      `"${t._id}"`,
      `"${(t.title || "").replace(/"/g, '""')}"`,
      `"${t.status || ""}"`,
      `"${t.priority || ""}"`,
      `"${t.dueDate ? new Date(t.dueDate).toLocaleDateString("fr-FR") : ""}"`,
      `"${Array.isArray(t.assignees) ? (t.assignees as { name: string }[]).map((a) => a.name).join("; ") : ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bloom-taches-${project?.title?.toLowerCase().replace(/[^a-z0-9]/g, "-") || "export"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Export CSV téléchargé avec succès !");
    trackTask("export_csv", {
      projectId,
      taskCount: tasks.length,
    });
  };

  // Liste combinée unique de tous les membres de l'espace et du projet assignables
  const availableMembersMap = new Map<string, { user: { _id: string; name: string }; role: string }>();
  [...workspaceMembers, ...projectMembers].forEach((m) => {
    if (m?.user?._id) {
      availableMembersMap.set(m.user._id, m);
    }
  });
  const members = Array.from(availableMembersMap.values());

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
              color: "#64748B",
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
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: "#1E293B", margin: 0 }}>
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
                    color: "#2563EB",
                  }}
                >
                  {project.status}
                </span>
              )}
            </div>
            {project?.description && (
              <p style={{ fontSize: 13.5, color: "#64748B", margin: 0, maxWidth: 650 }}>
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

      {/* Kanban Interactive Toolbar: Search, Filters & CSV Export */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          background: "#FFFFFF",
          padding: "12px 18px",
          borderRadius: 12,
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        }}
      >
        {/* Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 220, maxWidth: 380 }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Filtrer les tâches par titre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "#1E293B",
              background: "transparent",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                color: "#94A3B8",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Priority filter pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginRight: 2 }}>
              Priorité :
            </span>
            {[
              { id: "ALL", label: "Toutes" },
              { id: "High", label: "Haute" },
              { id: "Medium", label: "Moyenne" },
              { id: "Low", label: "Basse" },
            ].map((item) => {
              const active = selectedPriority === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedPriority(item.id);
                    trackEngagement("kanban_filter", "priority_change", { priority: item.id });
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: active ? 700 : 500,
                    background: active ? "#2D6A4F" : "#F1F5F9",
                    color: active ? "#FFFFFF" : "#475569",
                    border: active ? "1px solid #2D6A4F" : "1px solid #E2E8F0",
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={exportTasksCSV}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 7,
              background: "#F8FAFC",
              border: "1px solid #CBD5E1",
              color: "#334155",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#F1F5F9")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#F8FAFC")}
            title="Télécharger la liste des tâches au format CSV"
          >
            <Download size={13} />
            <span>Exporter CSV</span>
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
          const colTasks = filteredTasks.filter((t) => t.status === status);
          return (
            <div
              key={status}
              style={{
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
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
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1E293B", letterSpacing: "0.02em" }}>
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
                      border: "1px dashed #CBD5E1",
                      borderRadius: 10,
                      color: "#64748B",
                      fontSize: 12,
                    }}
                  >
                    Aucune tâche
                  </div>
                ) : (
                  colTasks.map((t) => <KanbanTaskCard key={t._id} task={t} projectId={projectId} />)
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
                  border: "1px dashed #CBD5E1",
                  color: "#64748B",
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
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.color = "#1E293B";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748B";
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
