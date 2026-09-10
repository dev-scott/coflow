"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Archive, Settings, LogOut, Plus,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { CoFlowLogo } from "@/components/logo";

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F6F9", color: "#1E293B" }}>

      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          background: "#FFFFFF",
          borderRight: "1px solid rgba(15,23,42,0.07)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
        }}
      >
        {/* Logo Section */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <CoFlowLogo size={32} />
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "#1E293B" }}>
              Co<span style={{ color: "#4D9972" }}>Flow</span>
            </span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div style={{ flex: 1, padding: "14px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Main Links */}
          <div>
            <p style={{
              fontSize: 10.5, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.10em", color: "#475569", padding: "0 10px", marginBottom: 6,
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
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 7,
                      fontSize: 13,
                      fontWeight: active ? 700 : 600,
                      color: active ? "#2D6A4F" : "#334155",
                      textDecoration: "none",
                      transition: "all 0.12s ease",
                      background: active ? "rgba(77,153,114,0.10)" : "transparent",
                    }}
                    onMouseOver={(e) => {
                      if (!active) e.currentTarget.style.background = "rgba(15,23,42,0.04)";
                    }}
                    onMouseOut={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Icon size={15} color={active ? "#3B805C" : "#64748B"} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Secondary Links */}
          <div>
            <p style={{
              fontSize: 10.5, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.10em", color: "#475569", padding: "0 10px", marginBottom: 6,
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
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 7,
                      fontSize: 13,
                      fontWeight: active ? 700 : 600,
                      color: active ? "#2D6A4F" : "#334155",
                      textDecoration: "none",
                      transition: "all 0.12s ease",
                      background: active ? "rgba(77,153,114,0.10)" : "transparent",
                    }}
                    onMouseOver={(e) => {
                      if (!active) e.currentTarget.style.background = "rgba(15,23,42,0.04)";
                    }}
                    onMouseOut={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Icon size={15} color={active ? "#3B805C" : "#64748B"} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(15,23,42,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #334155, #4D9972)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name ?? "Utilisateur"}
              </p>
              <p style={{ fontSize: 11, color: "#475569", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                {user?.email ?? ""}
              </p>
            </div>

            <button
              onClick={logout}
              title="Se déconnecter"
              style={{
                background: "none",
                border: "none",
                padding: 5,
                color: "#64748B",
                cursor: "pointer",
                borderRadius: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.12s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#DC2626")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#64748B")}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <header
          style={{
            height: 56,
            borderBottom: "1px solid rgba(15,23,42,0.07)",
            background: "#FFFFFF",
            position: "sticky",
            top: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
            {getPageTitle()}
          </span>

          <Link
            href="/workspaces"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 6,
              background: "#334155",
              fontSize: 12,
              fontWeight: 600,
              color: "#FFFFFF",
              textDecoration: "none",
              transition: "background 0.12s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#1E293B")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#334155")}
          >
            <Plus size={13} />
            Nouveau projet
          </Link>
        </header>

        {/* Page content */}
        <div
          style={{
            flex: 1,
            padding: "32px 36px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
