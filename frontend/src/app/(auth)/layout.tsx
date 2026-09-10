import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { CoFlowLogo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F8FA",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans)",
        overflow: "hidden",
      }}
    >
      {/* ── Subtle decorative background shapes ── */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(77,153,114,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(51,65,85,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Top Header ── */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          padding: "22px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
          background: "rgba(247,248,250,0.90)",
          backdropFilter: "blur(8px)",
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
          <CoFlowLogo size={32} />
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: "#0F172A" }}>
            Co<span style={{ color: "#3B805C" }}>Flow</span>
          </span>
        </Link>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "#334155",
            padding: "7px 14px",
            borderRadius: 8,
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            textDecoration: "none",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <ArrowLeft size={14} />
          Retour au site
        </Link>
      </header>

      {/* ── Center Content (children = form card) ── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
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
          padding: "18px",
          borderTop: "1px solid #E2E8F0",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          fontSize: 12,
          color: "#475569",
          fontWeight: 500,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ShieldCheck size={14} color="#3B805C" />
          Chiffrement SSL 256-bit
        </span>
        <span style={{ color: "#CBD5E1" }}>•</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Lock size={13} color="#475569" />
          Hébergement sécurisé & RGPD
        </span>
      </footer>
    </div>
  );
}
