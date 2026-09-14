import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Sparkles } from "lucide-react";
import { CoFlowLogo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page-wrapper">
      {/* ── Signature Atmospheric Glows (Matches Home & Dashboard) ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-160px",
          right: "-160px",
          width: "560px",
          height: "560px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(77,153,114,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "-120px",
          left: "-120px",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(51,65,85,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Sleek Header Navigation ── */}
      <header
        style={{
          position: "relative",
          zIndex: 20,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <CoFlowLogo size={28} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: "#1E293B" }}>
              Co<span style={{ color: "#4D9972" }}>Flow</span>
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                fontWeight: 700,
                color: "#3B805C",
                background: "rgba(77, 153, 114, 0.12)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              v2.0
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="lp-btn-ghost"
          style={{
            height: 34,
            padding: "0 14px",
            fontSize: 12.5,
            fontWeight: 600,
            borderRadius: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ArrowLeft size={13} />
          Retour à l&apos;accueil
        </Link>
      </header>

      {/* ── Main Form Area ── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 20px 64px",
          flex: 1,
        }}
      >
        {children}
      </main>

      {/* ── Footer Trust Marks ── */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          padding: "18px 24px",
          borderTop: "1px solid rgba(15, 23, 42, 0.06)",
          background: "rgba(255, 255, 255, 0.60)",
          backdropFilter: "blur(8px)",
          textAlign: "center",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontSize: 12,
          color: "#64748B",
          fontWeight: 500,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ShieldCheck size={14} color="#3B805C" />
          Chiffrement SSL 256-bit
        </span>
        <span style={{ color: "#CBD5E1" }}>•</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Lock size={13} color="#64748B" />
          Espaces de travail cloisonnés & sécurisés
        </span>
        <span style={{ color: "#CBD5E1" }}>•</span>
        <span>© {new Date().getFullYear()} CoFlow</span>
      </footer>
    </div>
  );
}
