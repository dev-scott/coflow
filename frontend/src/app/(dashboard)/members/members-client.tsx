"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Search, LayoutGrid, List, ShieldCheck,
  UserCheck, Eye, Crown, Mail, Calendar, ChevronDown
} from "lucide-react";
import { fetchData } from "@/lib/fetch-util";
import type { Workspace, WorkspaceMemberRole } from "@/types";

const ROLE_BADGE: Record<WorkspaceMemberRole, { label: string; color: string; bg: string; icon: any }> = {
  owner: { label: "Propriétaire", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", icon: Crown },
  admin: { label: "Administrateur", color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)", icon: ShieldCheck },
  member: { label: "Membre", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", icon: UserCheck },
  viewer: { label: "Lecteur", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)", icon: Eye },
};

export default function MembersClient() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data: workspaces, isLoading: wsLoading } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: () => fetchData("/workspaces"),
  });

  // Default to first workspace if none selected
  const currentWorkspace = workspaces?.find((w) =>
    selectedWorkspaceId ? w._id === selectedWorkspaceId : true
  );

  const members = currentWorkspace?.members ?? [];
  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    const name = m.user?.name?.toLowerCase() ?? "";
    const email = m.user?.email?.toLowerCase() ?? "";
    const role = m.role?.toLowerCase() ?? "";
    return name.includes(q) || email.includes(q) || role.includes(q);
  });

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(59, 130, 246, 0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#3b82f6",
            }}>
              <Users size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
                Membres de l'équipe
              </h1>
              <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: "4px 0 0" }}>
                Gérez les collaborateurs et permissions de vos espaces de travail
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Selector */}
        {workspaces && workspaces.length > 0 && (
          <div style={{ position: "relative" }}>
            <select
              value={currentWorkspace?._id ?? ""}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              style={{
                appearance: "none",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "var(--foreground)",
                padding: "8px 36px 8px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                outline: "none",
              }}
            >
              {workspaces.map((ws) => (
                <option key={ws._id} value={ws._id} style={{ background: "#111", color: "#fff" }}>
                  Espace: {ws.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#888" }}
            />
          </div>
        )}
      </div>

      {/* Control Bar: Search & View switcher */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, marginBottom: 24, flexWrap: "wrap",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 260, maxWidth: 420 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#666" }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou rôle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "var(--foreground)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", padding: 3, borderRadius: 8 }}>
          <button
            onClick={() => setViewMode("list")}
            style={{
              background: viewMode === "list" ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none", color: viewMode === "list" ? "#fff" : "#888",
              padding: "6px 10px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12,
            }}
          >
            <List size={14} /> Liste
          </button>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              background: viewMode === "grid" ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none", color: viewMode === "grid" ? "#fff" : "#888",
              padding: "6px 10px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12,
            }}
          >
            <LayoutGrid size={14} /> Grille
          </button>
        </div>
      </div>

      {/* Loading state */}
      {wsLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card" style={{ height: 60, borderRadius: 10, opacity: 0.5 }} />
          ))}
        </div>
      ) : !currentWorkspace ? (
        <div className="glass-card" style={{ padding: "60px 24px", textAlign: "center", borderRadius: 12 }}>
          <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
            Aucun espace de travail trouvé. Créez-en un pour inviter des membres.
          </p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="glass-card" style={{ padding: "60px 24px", textAlign: "center", borderRadius: 12 }}>
          <Users size={36} color="#555" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
            Aucun membre ne correspond à votre recherche.
          </p>
        </div>
      ) : viewMode === "list" ? (
        /* List View */
        <div className="glass-card" style={{ borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr",
            padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b",
          }}>
            <span>Collaborateur</span>
            <span>Email</span>
            <span>Rôle</span>
            <span style={{ textAlign: "right" }}>Espace</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredMembers.map((member) => {
              const roleInfo = ROLE_BADGE[member.role] ?? ROLE_BADGE.member;
              const RoleIcon = roleInfo.icon;
              return (
                <div
                  key={member.user._id}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr",
                    alignItems: "center", padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "rgba(124, 58, 237, 0.15)", color: "#a78bfa",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>
                      {member.user.profilePicture ? (
                        <img
                          src={member.user.profilePicture}
                          alt={member.user.name}
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        member.user.name?.charAt(0).toUpperCase() ?? "U"
                      )}
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--foreground)" }}>
                      {member.user.name}
                    </span>
                  </div>

                  <span style={{ fontSize: 13, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Mail size={13} color="#666" />
                    {member.user.email}
                  </span>

                  <div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                      background: roleInfo.bg, color: roleInfo.color,
                    }}>
                      <RoleIcon size={12} />
                      {roleInfo.label}
                    </span>
                  </div>

                  <span style={{ fontSize: 12, color: "#64748b", textAlign: "right" }}>
                    {currentWorkspace.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
          {filteredMembers.map((member) => {
            const roleInfo = ROLE_BADGE[member.role] ?? ROLE_BADGE.member;
            const RoleIcon = roleInfo.icon;
            return (
              <div
                key={member.user._id}
                className="glass-card card-hover"
                style={{ padding: "24px 20px", borderRadius: 12, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(124, 58, 237, 0.15)", color: "#a78bfa",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 20, marginBottom: 14,
                }}>
                  {member.user.profilePicture ? (
                    <img
                      src={member.user.profilePicture}
                      alt={member.user.name}
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    member.user.name?.charAt(0).toUpperCase() ?? "U"
                  )}
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: "0 0 4px" }}>
                  {member.user.name}
                </h3>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", margin: "0 0 14px", wordBreak: "break-all" }}>
                  {member.user.email}
                </p>

                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 11.5, fontWeight: 600, padding: "4px 12px", borderRadius: 999,
                  background: roleInfo.bg, color: roleInfo.color,
                }}>
                  <RoleIcon size={13} />
                  {roleInfo.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
