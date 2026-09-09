import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07070c",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-sans)",
        overflow: "hidden",
      }}
    >
      {/* ── Ambient Background Glows ── */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "450px",
          background: "radial-gradient(circle at center, rgba(124, 58, 237, 0.14) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 80%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "10%",
          width: "600px",
          height: "400px",
          background: "radial-gradient(circle at center, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Top Header ── */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 0 16px rgba(124, 58, 237, 0.4)",
            }}
          >
            <Zap size={18} fill="#fff" />
          </div>
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
            Co<span style={{ color: "#a78bfa" }}>Flow</span>
          </span>
        </Link>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 500,
            color: "#888",
            padding: "6px 14px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <ArrowLeft size={13} />
          Retour au site
        </Link>
      </header>

      {/* ── Center Content ── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          flex: 1,
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          {children}
        </div>
      </main>

      {/* ── Footer Trust Marks ── */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          padding: "20px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontSize: 11.5,
          color: "#555",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <ShieldCheck size={13} color="#10b981" /> Chiffrement SSL 256-bit
        </span>
        <span>•</span>
        <span>Hébergement sécurisé & RGPD</span>
      </footer>
    </div>
  );
}
