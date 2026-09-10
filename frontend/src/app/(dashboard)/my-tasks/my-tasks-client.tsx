"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare, Clock, AlertTriangle, CheckCircle2,
  Search, Filter, Calendar, ArrowUpRight, Check
} from "lucide-react";
import Link from "next/link";
import { fetchData } from "@/lib/fetch-util";
import type { Task } from "@/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "To Do":       { label: "À faire", color: "#475569", bg: "#EEF1F6" },
  "In Progress": { label: "En cours", color: "#2563EB", bg: "rgba(59, 130, 246, 0.12)" },
  "Review":      { label: "En révision", color: "#D97706", bg: "rgba(245, 158, 11, 0.12)" },
  "Done":        { label: "Terminée", color: "#059669", bg: "rgba(16, 185, 129, 0.12)" },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  High:   { color: "#DC2626", bg: "rgba(239, 68, 68, 0.12)", label: "Haute" },
  Medium: { color: "#D97706", bg: "rgba(245, 158, 11, 0.12)", label: "Moyenne" },
  Low:    { color: "#475569", bg: "rgba(100, 116, 139, 0.12)", label: "Basse" },
};

function TaskCard({ task }: { task: Task }) {
  const p = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.Medium;
  const s = STATUS_CONFIG[task.status] ?? STATUS_CONFIG["To Do"];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done";

  return (
    <Link href={`/tasks/${task._id}`} style={{ textDecoration: "none" }}>
      <div
        className="glass-card card-hover"
        style={{
          padding: "16px 20px",
          borderRadius: 12,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          cursor: "pointer",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          {/* Status Indicator circle */}
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: `2px solid ${s.color}`,
              background: task.status === "Done" ? s.color : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {task.status === "Done" && <Check size={13} color="#fff" strokeWidth={3} />}
          </div>

          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1E293B",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textDecoration: task.status === "Done" ? "line-through" : "none",
                opacity: task.status === "Done" ? 0.5 : 1,
              }}
            >
              {task.title}
            </p>
            {task.description && (
              <p
                style={{
                  fontSize: 12,
                  color: "#64748B",
                  margin: "2px 0 0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Status badge */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 6,
              background: s.bg,
              color: s.color,
            }}
          >
            {s.label}
          </span>

          {/* Priority badge */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 6,
              background: p.bg,
              color: p.color,
            }}
          >
            {p.label}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <span
              style={{
                fontSize: 11.5,
                color: isOverdue ? "#DC2626" : "#64748B",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {isOverdue ? <AlertTriangle size={13} /> : <Calendar size={13} />}
              {new Date(task.dueDate).toLocaleDateString("fr-FR")}
            </span>
          )}

          <ArrowUpRight size={14} color="#94A3B8" />
        </div>
      </div>
    </Link>
  );
}

export default function MyTasksClient() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["my-tasks"],
    queryFn: () => fetchData("/tasks/my-tasks"),
  });

  const allTasks = tasks ?? [];
  const todo = allTasks.filter((t) => t.status === "To Do");
  const inProgress = allTasks.filter((t) => t.status === "In Progress");
  const review = allTasks.filter((t) => t.status === "Review");
  const done = allTasks.filter((t) => t.status === "Done");

  const filteredTasks = allTasks.filter((t) => {
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const stats = [
    { label: "À faire", count: todo.length, icon: Clock, color: "#475569", bg: "#EEF1F6", key: "To Do" },
    { label: "En cours", count: inProgress.length, icon: CheckSquare, color: "#2563EB", bg: "rgba(59,130,246,0.12)", key: "In Progress" },
    { label: "En révision", count: review.length, icon: AlertTriangle, color: "#D97706", bg: "rgba(245,158,11,0.12)", key: "Review" },
    { label: "Terminées", count: done.length, icon: CheckCircle2, color: "#059669", bg: "rgba(16,185,129,0.12)", key: "Done" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: "#1E293B", margin: "0 0 4px" }}>
          Mes tâches
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
          Suivez et organisez toutes les activités qui vous sont personnellement assignées.
        </p>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {stats.map(({ label, count, icon: Icon, color, bg, key }) => (
          <div
            key={label}
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
            className="glass-card card-hover"
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              background: "#FFFFFF",
              border: filterStatus === key ? `2px solid #334155` : "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#1E293B" }}>
                {isLoading ? "—" : count}
              </p>
              <p style={{ fontSize: 11.5, color: "#64748B", margin: 0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 260, maxWidth: 400 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input
            type="text"
            placeholder="Filtrer mes tâches par mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              color: "#1E293B",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "Toutes" },
            { key: "In Progress", label: "En cours" },
            { key: "To Do", label: "À faire" },
            { key: "Review", label: "En révision" },
            { key: "Done", label: "Terminées" },
          ].map((pill) => {
            const active = filterStatus === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => setFilterStatus(pill.key)}
                style={{
                  background: active ? "#334155" : "#F1F5F9",
                  border: active ? "1px solid #334155" : "1px solid #E2E8F0",
                  color: active ? "#FFFFFF" : "#475569",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card" style={{ height: 56, borderRadius: 10, opacity: 0.4 }} />
          ))}
        </div>
      ) : !filteredTasks.length ? (
        <div
          className="glass-card"
          style={{
            textAlign: "center",
            padding: "60px 24px",
            borderRadius: 14,
            border: "1px dashed #CBD5E1",
          }}
        >
          <CheckSquare size={36} color="#94A3B8" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "#1E293B", fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>
            Aucune tâche trouvée
          </p>
          <p style={{ color: "#64748B", fontSize: 12.5, margin: 0 }}>
            {search || filterStatus !== "all"
              ? "Modifiez vos critères de recherche ou réinitialisez le filtre."
              : "Vous n'avez pas de tâche assignée pour le moment."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredTasks.map((t) => (
            <TaskCard key={t._id} task={t} />
          ))}
        </div>
      )}
    </div>
  );
}
