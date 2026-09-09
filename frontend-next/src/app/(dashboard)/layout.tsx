"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Archive, Settings, LogOut, Zap, Plus, Search,
  Bell, HelpCircle, ExternalLink
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const NAV_MAIN = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/workspaces", label: "Espaces de travail", icon: FolderKanban },
  { href: "/my-tasks", label: "Mes tâches", icon: CheckSquare },
];

const NAV_SECONDARY = [
  { href: "/members", label: "Équipe & Membres", icon: Users },
  { href: "/achieved", label: "Réalisés & Archives", icon: Archive },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Tableau de bord";
    if (pathname.startsWith("/workspaces")) return "Espaces de travail";
    if (pathname.startsWith("/my-tasks")) return "Mes tâches";
    if (pathname.startsWith("/members")) return "Équipe & Membres";
    if (pathname.startsWith("/achieved")) return "Réalisés & Archives";
    if (pathname.startsWith("/settings")) return "Paramètres du compte";
    if (pathname.startsWith("/projects")) return "Projet";
    if (pathname.startsWith("/tasks")) return "Détail de la tâche";
    return "Espace de travail";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#08080d", color: "#f1f5f9" }}>
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          background: "rgba(11, 11, 17, 0.95)",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo Section */}
        <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 0 16px rgba(124, 58, 237, 0.35)",
              }}
            >
              <Zap size={16} fill="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
              Co<span style={{ color: "#a78bfa" }}>Flow</span>
            </span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div style={{ flex: 1, padding: "16px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Main Links */}
          <div>
            <p style={{
              fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#52525b", padding: "0 10px", marginBottom: 8,
            }}>
              Principal
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_MAIN.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={active ? "nav-active" : ""}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "9px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      color: active ? "#c4b5fd" : "#888899",
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                      background: active ? "rgba(124, 58, 237, 0.12)" : "transparent",
                    }}
                    onMouseOver={(e) => {
                      if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                    onMouseOut={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Icon size={16} color={active ? "#a78bfa" : "#71717a"} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Secondary Links */}
          <div>
            <p style={{
              fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#52525b", padding: "0 10px", marginBottom: 8,
            }}>
              Organisation
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_SECONDARY.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={active ? "nav-active" : ""}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "9px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      color: active ? "#c4b5fd" : "#888899",
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                      background: active ? "rgba(124, 58, 237, 0.12)" : "transparent",
                    }}
                    onMouseOver={(e) => {
                      if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                    onMouseOut={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Icon size={16} color={active ? "#a78bfa" : "#71717a"} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card in Footer */}
        <div style={{ padding: "14px 12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))",
                  border: "1px solid rgba(124,58,237,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#e8e8f0",
                }}
              >
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                  border: "2px solid #0b0b11",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 12.5, fontWeight: 600, color: "#f1f5f9", margin: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user?.name ?? "Utilisateur"}
              </p>
              <p style={{
                fontSize: 11, color: "#71717a", margin: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {user?.email ?? ""}
              </p>
            </div>

            <button
              onClick={logout}
              title="Se déconnecter"
              style={{
                background: "none",
                border: "none",
                padding: 6,
                color: "#71717a",
                cursor: "pointer",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.15s ease",
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
              onMouseOut={(e) => e.currentTarget.style.color = "#71717a"}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar header */}
        <header
          style={{
            height: 60,
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            background: "rgba(8, 8, 13, 0.8)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#e2e8f0" }}>
              {getPageTitle()}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/workspaces"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: 12,
                fontWeight: 600,
                color: "#e2e8f0",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Plus size={13} />
              Nouveau projet
            </Link>
          </div>
        </header>

        {/* Ambient glow under top bar */}
        <div
          style={{
            position: "relative",
            flex: 1,
            padding: "32px 36px",
            background: "radial-gradient(circle at 10% 0%, rgba(124, 58, 237, 0.04) 0%, transparent 40%)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
