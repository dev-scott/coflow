"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Archive, Settings, LogOut, Plus, Zap, Crown, Clock,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { usePlan } from "@/hooks/use-plan";
import { CoFlowLogo } from "@/components/logo";
import { UpgradeModal } from "@/components/upgrade-modal";

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
  const {
    isPro,
    isProPaid,
    isTrialActive,
    isTrialExpired,
    isEnterprise,
    canStartTrial,
    daysLeftInTrial,
  } = usePlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

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
            <span
              className="brand-logo-text"
              style={{
                fontFamily: "var(--font-logo)",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-0.035em",
                color: "#0F172A",
              }}
            >
              Co<span
                className="brand-logo-accent"
                style={{
                  background: "linear-gradient(135deg, #2E6047 0%, #4D9972 65%, #6BAF8A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 800,
                }}
              >
                Flow
              </span>
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

        {/* Plan status card in sidebar */}
        <div style={{ margin: "0 10px 10px", padding: "10px 12px", borderRadius: 8, background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isProPaid || isEnterprise ? 0 : 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: isTrialActive || isProPaid ? "#2D6A4F" : isTrialExpired ? "#D97706" : "#64748B" }}>
              {isEnterprise ? "Entreprise" : isProPaid ? "Plan Pro" : isTrialActive ? "Essai Pro" : isTrialExpired ? "Starter" : "Starter"}
            </span>
            {isTrialActive && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#3B805C", background: "rgba(59,128,92,0.12)", padding: "1px 6px", borderRadius: 10 }}>
                {daysLeftInTrial}j restants
              </span>
            )}
            {isTrialExpired && (
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "#D97706", background: "rgba(245,158,11,0.12)", padding: "1px 5px", borderRadius: 8 }}>
                Essai expiré
              </span>
            )}
          </div>

          {!isProPaid && !isEnterprise && (
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              style={{
                width: "100%",
                padding: "5px 8px",
                marginTop: 4,
                fontSize: 11,
                fontWeight: 600,
                color: isTrialExpired ? "#D97706" : "#2D6A4F",
                background: "transparent",
                border: isTrialExpired ? "1px dashed rgba(217,119,6,0.4)" : "1px dashed rgba(59,128,92,0.35)",
                borderRadius: 5,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                transition: "background 0.12s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = isTrialExpired ? "rgba(217,119,6,0.06)" : "rgba(59,128,92,0.06)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Zap size={11} color={isTrialExpired ? "#D97706" : "#3B805C"} />
              {isTrialActive ? "Passer au Plan Pro" : isTrialExpired ? "Réactiver Pro" : "Essayer Pro (14j)"}
            </button>
          )}

          {isProPaid && (
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              style={{
                width: "100%",
                padding: "4px 8px",
                marginTop: 4,
                fontSize: 10.5,
                fontWeight: 600,
                color: "#2D6A4F",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Gérer mon abonnement →
            </button>
          )}
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

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isTrialActive && (
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: daysLeftInTrial <= 3 ? "rgba(245,158,11,0.12)" : "rgba(59,128,92,0.10)",
                  border: daysLeftInTrial <= 3 ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(59,128,92,0.25)",
                  color: daysLeftInTrial <= 3 ? "#B45309" : "#2D6A4F",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                title="Cliquez pour finaliser votre abonnement Pro"
              >
                <Zap size={13} fill={daysLeftInTrial <= 3 ? "#D97706" : "#3B805C"} color={daysLeftInTrial <= 3 ? "#D97706" : "#3B805C"} />
                <span>
                  {daysLeftInTrial <= 3
                    ? `Fin d'essai dans ${daysLeftInTrial}j · Passer en Pro`
                    : `Essai Pro · ${daysLeftInTrial}j restant${daysLeftInTrial > 1 ? "s" : ""}`}
                </span>
              </button>
            )}

            {isTrialExpired && (
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.35)",
                  color: "#B45309",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Clock size={13} />
                <span>Essai terminé · Débloquer Pro</span>
              </button>
            )}

            {isProPaid && (
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: "rgba(59,128,92,0.12)",
                  border: "1px solid rgba(59,128,92,0.3)",
                  color: "#2D6A4F",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Crown size={13} color="#2D6A4F" />
                <span>Plan Pro Actif</span>
              </button>
            )}

            {canStartTrial && (
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: "linear-gradient(135deg, rgba(59,128,92,0.12) 0%, rgba(37,99,235,0.08) 100%)",
                  border: "1px solid rgba(59,128,92,0.3)",
                  color: "#2D6A4F",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, rgba(59,128,92,0.2) 0%, rgba(37,99,235,0.15) 100%)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, rgba(59,128,92,0.12) 0%, rgba(37,99,235,0.08) 100%)")}
              >
                <Zap size={13} color="#3B805C" />
                <span>Essayer Pro (14j)</span>
              </button>
            )}

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
              Nouvel espace
            </Link>
          </div>
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

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
