"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, FolderKanban, Users, ArrowRight, X, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fetchData, postData } from "@/lib/fetch-util";
import type { Workspace } from "@/types";

const COLORS = [
  "#7c3aed", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#3b82f6", "#8b5cf6"
];

const schema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  description: z.string().optional(),
  color: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

function CreateWorkspaceModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { color: COLORS[0] },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: FormData) => postData<Workspace>("/workspaces", d),
    onSuccess: (newWs) => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success(`Espace "${newWs.name}" créé avec succès !`);
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || "Erreur de création"),
  });

  const selectedColor = watch("color");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.75)",
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
          background: "#111118",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          borderRadius: 16,
          padding: "32px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05) inset",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(124, 58, 237, 0.15)",
                color: "#a78bfa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderKanban size={16} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#f1f5f9", margin: 0 }}>
              Nouvel espace de travail
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              padding: 6,
              color: "#71717a",
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: "#71717a", margin: "0 0 24px" }}>
          Regroupez vos projets, invitez vos collaborateurs et suivez l'avancement global.
        </p>

        <form onSubmit={handleSubmit((d) => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
              Nom de l'espace *
            </label>
            <input
              {...register("name")}
              placeholder="ex: Design Studio, Core Product, Marketing..."
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                border: errors.name ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                color: "#f1f5f9",
                fontSize: 13.5,
                outline: "none",
              }}
            />
            {errors.name && (
              <p style={{ fontSize: 11.5, color: "#ef4444", marginTop: 4, margin: "4px 0 0" }}>
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>
              Description de l'équipe (optionnel)
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Objectifs, périmètre ou équipe assignée..."
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                color: "#f1f5f9",
                fontSize: 13.5,
                outline: "none",
                resize: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginBottom: 10 }}>
              Thème couleur
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("color", c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: c,
                    border: "none",
                    outline: selectedColor === c ? `2px solid #fff` : "2px solid transparent",
                    outlineOffset: 3,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    transform: selectedColor === c ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 42,
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
                height: 42,
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
                "Créer l'espace"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WorkspacesClient() {
  const [showModal, setShowModal] = useState(false);

  const { data: workspaces, isLoading } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: () => fetchData("/workspaces"),
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: "#f1f5f9", margin: 0 }}>
              Espaces de travail
            </h1>
            {workspaces && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(124, 58, 237, 0.15)",
                  color: "#a78bfa",
                }}
              >
                {workspaces.length}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13.5, color: "#71717a", margin: 0 }}>
            Organisez vos projets et vos équipes par département ou client.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="lp-btn-pro"
          style={{ height: 40, borderRadius: 8, fontSize: 13 }}
        >
          <Plus size={15} />
          Nouveau workspace
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card" style={{ height: 180, borderRadius: 14, opacity: 0.4 }} />
          ))}
        </div>
      ) : !workspaces?.length ? (
        <div
          className="glass-card"
          style={{
            textAlign: "center",
            padding: "80px 24px",
            borderRadius: 16,
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "rgba(124, 58, 237, 0.12)",
              color: "#a78bfa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <FolderKanban size={26} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>
            Aucun espace de travail créé
          </h3>
          <p style={{ color: "#71717a", fontSize: 13.5, maxWidth: 360, margin: "0 auto 20px" }}>
            Créez votre premier espace de travail pour lancer vos projets et collaborer avec votre équipe.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="lp-btn-primary"
            style={{ borderRadius: 8, height: 40, margin: "0 auto" }}
          >
            <Plus size={15} />
            Créer un workspace
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {workspaces.map((ws) => {
            const wsColor = ws.color || "#7c3aed";
            return (
              <Link key={ws._id} href={`/workspaces/${ws._id}`} style={{ textDecoration: "none" }}>
                <div
                  className="glass-card card-hover"
                  style={{
                    padding: "24px",
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 180,
                    position: "relative",
                  }}
                >
                  <div>
                    {/* Top Row: Color avatar & arrow */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: wsColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 16,
                          color: "#fff",
                          boxShadow: `0 4px 16px ${wsColor}44`,
                        }}
                      >
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <ArrowRight size={16} color="#52525b" />
                    </div>

                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        color: "#f1f5f9",
                        margin: "0 0 6px",
                      }}
                    >
                      {ws.name}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#71717a",
                        margin: 0,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {ws.description || "Aucune description fournie pour cet espace."}
                    </p>
                  </div>

                  {/* Footer Stats: Members & Projects */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 16,
                      marginTop: 16,
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#a1a1aa" }}>
                      <Users size={13} color="#71717a" />
                      <span>
                        {ws.members?.length || 1} membre{(ws.members?.length || 1) > 1 ? "s" : ""}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#a78bfa",
                        background: "rgba(124, 58, 237, 0.10)",
                        padding: "2px 8px",
                        borderRadius: 6,
                      }}
                    >
                      Ouvrir l'espace →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && <CreateWorkspaceModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
