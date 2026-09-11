"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  X,
  CircleCheck,
  Clock,
  Plus,
  Minus,
  Menu,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { CoFlowLogo } from "@/components/logo";

const FAQ_ITEMS = [
  {
    q: "C'est gratuit pour commencer ?",
    a: "Oui. Le plan Starter est gratuit sans limite dans le temps — 3 workspaces, 5 membres, kanban illimité. Aucune carte bancaire.",
  },
  {
    q: "Comment inviter mon équipe ?",
    a: "Chaque workspace génère un lien d'invitation unique. Vos collègues rejoignent en deux clics après connexion ou inscription.",
  },
  {
    q: "On peut personnaliser les statuts des tâches ?",
    a: "Vous avez quatre statuts (À faire, En cours, En revue, Terminé) et quatre niveaux de priorité. Vous organisez votre flux comme vous le voulez.",
  },
  {
    q: "Et si j'ai besoin de plus de workspaces ?",
    a: "Le plan Pro déverrouille les workspaces illimités, les membres illimités et les analytics avancées pour 10€/utilisateur/mois (facturation annuelle).",
  },
];

const MARQUEE_ITEMS = [
  "Multi-workspaces",
  "Kanban sans friction",
  "Suivi en temps réel",
  "Assignation nominative",
  "Priorités personnalisées",
  "Progression automatique",
  "Invitations sécurisées",
  "Interface rapide",
  "Zéro abonnement inutile",
  "Données hébergées en Europe",
];

interface PreviewCard {
  label: string;
  tag: string;
  tagBg: string;
  tagFg: string;
  priority?: string;
  pBg?: string;
  pFg?: string;
  assignee?: string;
  ava?: string;
  progress?: number;
  done?: boolean;
  closedAt?: string;
}

interface PreviewColumn {
  title: string;
  dot: string;
  pulse?: boolean;
  cards: PreviewCard[];
}

export default function HomeClient() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const previewColumns: PreviewColumn[] = [
    {
      title: "À faire",
      dot: "#64748b",
      cards: [
        {
          label: "Refactoriser Header",
          tag: "Frontend",
          tagBg: "rgba(59,130,246,0.10)",
          tagFg: "#2563EB",
          priority: "Moyenne",
          pBg: "rgba(245,158,11,0.12)",
          pFg: "#D97706",
          assignee: "AL",
          ava: "#334155",
        },
        {
          label: "Refonte Design System",
          tag: "Design",
          tagBg: "rgba(77,153,114,0.12)",
          tagFg: "#3B805C",
          priority: "Haute",
          pBg: "rgba(239,68,68,0.12)",
          pFg: "#DC2626",
          assignee: "SC",
          ava: "#0891b2",
        },
      ],
    },
    {
      title: "En cours",
      dot: "#4D9972",
      pulse: true,
      cards: [
        {
          label: "Flux invitation sécurisé",
          tag: "Auth",
          tagBg: "rgba(16,185,129,0.12)",
          tagFg: "#059669",
          priority: "Haute",
          pBg: "rgba(239,68,68,0.12)",
          pFg: "#DC2626",
          assignee: "ML",
          ava: "#334155",
          progress: 70,
        },
        {
          label: "Graphiques de vélocité",
          tag: "Analytics",
          tagBg: "rgba(77,153,114,0.10)",
          tagFg: "#3B805C",
          priority: "Basse",
          pBg: "rgba(100,116,139,0.12)",
          pFg: "#475569",
          assignee: "ED",
          ava: "#b45309",
        },
      ],
    },
    {
      title: "Terminé",
      dot: "#10b981",
      cards: [
        {
          label: "Migration React 19",
          tag: "Infra",
          tagBg: "rgba(100,116,139,0.1)",
          tagFg: "#64748b",
          done: true,
          closedAt: "Il y a 2h",
        },
        {
          label: "Auth JWT & sessions",
          tag: "Auth",
          tagBg: "rgba(100,116,139,0.1)",
          tagFg: "#64748b",
          done: true,
          closedAt: "Hier",
        },
      ],
    },
  ];

  return (
    <div
      className="min-h-screen overflow-x-hidden font-sans antialiased"
      style={{ background: "#F7F8FA", color: "#1E293B" }}
    >
      {/* Subtle top-right decorative circle */}
      {/* <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-180px",
          right: "-180px",
          width: "560px",
          height: "560px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(77,153,114,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      /> */}

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderColor: "rgba(15,23,42,0.07)",
          background: "rgba(247,248,250,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-8" style={{ display: "flex", alignItems: "center" }}>
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <CoFlowLogo size={32} />
            <span className="font-bold tracking-tight" style={{ color: "#1E293B", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Co<span style={{ color: "#4D9972" }}>Flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 ml-6 text-[13px]" style={{ color: "#334155", gap: 28, fontSize: 13.5, fontWeight: 500 }}>
            {[
              { label: "Pourquoi CoFlow", href: "#why" },
              { label: "Fonctionnalités", href: "#features" },
              { label: "Tarifs", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{ color: "#334155", transition: "color 0.15s" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#0F172A")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#334155")}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto hidden sm:flex items-center gap-4" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
            {isAuthenticated ? (
              <Link href="/dashboard" className="lp-btn-nav">
                Mon workspace <ArrowRight size={14} className="lp-arrow" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  style={{ color: "#0F172A", fontSize: 13.5, fontWeight: 600, transition: "color 0.15s", textDecoration: "none" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#3B805C")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#0F172A")}
                >
                  Connexion
                </Link>
                <Link href="/sign-up" className="lp-btn-nav">
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-auto md:hidden p-1.5"
            style={{ marginLeft: "auto", color: "#1E293B", background: "none", border: "none", cursor: "pointer", padding: 6 }}
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div
            className="md:hidden px-6 pt-3 pb-6 border-t space-y-1"
            style={{
              borderColor: "rgba(15,23,42,0.07)",
              background: "#FFFFFF",
              padding: "12px 24px 24px",
            }}
          >
            {[
              { label: "Pourquoi CoFlow", href: "#why" },
              { label: "Fonctionnalités", href: "#features" },
              { label: "Tarifs", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm"
                style={{ display: "block", padding: "10px 0", fontSize: 14, color: "#1E293B", fontWeight: 500 }}
              >
                {item.label}
              </a>
            ))}
            <div
              className="pt-4 flex flex-col gap-2 border-t"
              style={{ borderColor: "rgba(15,23,42,0.07)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}
            >
              {isAuthenticated ? (
                <Link href="/dashboard" className="lp-btn-mobile-primary">
                  Mon workspace
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" style={{ textAlign: "center", padding: "8px 0", fontSize: 14, color: "#1E293B", fontWeight: 600, display: "block" }}>
                    Connexion
                  </Link>
                  <Link href="/sign-up" className="lp-btn-mobile-primary">
                    Commencer gratuitement
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative max-w-screen-xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 z-10" style={{ position: "relative", zIndex: 10 }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-8" style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 32, color: "#3B805C" }}>
          v2.0 — Gestion de projet
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start" style={{ display: "grid", alignItems: "flex-start" }}>
          <div>
            <h1
              className="font-bold leading-[1.03] tracking-[-0.04em] text-[3.2rem] sm:text-[4.5rem] lg:text-[5.5rem]"
              style={{
                fontWeight: 800,
                lineHeight: 1.03,
                letterSpacing: "-0.04em",
                color: "#1E293B",
              }}
            >
              Votre équipe<br />
              mérite mieux<br />
              <span
                className="italic"
                style={{
                  fontStyle: "italic",
                  background: "linear-gradient(90deg, #334155 0%, #4D9972 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                qu&apos;un tableau
              </span><br />
              <span style={{ color: "#1E293B" }}>Excel.</span>
            </h1>

            <p className="mt-8 text-base leading-relaxed max-w-md" style={{ marginTop: 32, fontSize: 16, lineHeight: 1.625, maxWidth: 448, color: "#334155" }}>
              CoFlow met vos projets, vos tâches et vos collaborateurs dans un seul endroit — sans vous noyer sous les fonctionnalités que personne n&apos;utilise.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5" style={{ marginTop: 40, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
              <Link href={isAuthenticated ? "/dashboard" : "/sign-up"} className="lp-btn-primary">
                {isAuthenticated ? "Ouvrir mon workspace" : "Démarrer — c'est gratuit"}
                <ArrowRight size={16} className="lp-arrow" />
              </Link>
              <a href="#why" className="lp-text-link">
                En savoir plus<span className="lp-text-arrow">→</span>
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-mono" style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: "8px 24px", fontSize: 12, fontFamily: "monospace", color: "#475569", fontWeight: 500 }}>
              <span>→ Aucune carte bancaire</span>
              <span>→ Setup en 30 secondes</span>
              <span>→ Données hébergées en Europe</span>
            </div>
          </div>


          {/* Preview Mockup */}
          <div id="preview" className="relative mt-4 lg:mt-0" style={{ position: "relative" }}>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                borderRadius: 16,
                border: "1px solid rgba(15,23,42,0.10)",
                background: "#FFFFFF",
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(15,23,42,0.10)",
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(15,23,42,0.07)",
                  background: "#F7F8FA",
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                <span className="ml-3 font-mono text-[11px]" style={{ marginLeft: 12, fontFamily: "monospace", fontSize: 11, color: "#94A3B8" }}>
                  coflow.app / ws / core-platform
                </span>
              </div>

              <div className="p-4 grid grid-cols-3 gap-3" style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {previewColumns.map((col, idx) => (
                  <div key={idx} className="flex flex-col gap-2" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div
                      className="flex items-center gap-1.5 mb-1 pb-2 border-b"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                        paddingBottom: 8,
                        borderBottom: "1px solid rgba(15,23,42,0.07)",
                      }}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${col.pulse ? "animate-pulse" : ""}`}
                        style={{ width: 8, height: 8, borderRadius: "50%", background: col.dot }}
                      />
                      <span className="text-[10px] font-medium" style={{ fontSize: 10, fontWeight: 500, color: "#64748B" }}>
                        {col.title}
                      </span>
                    </div>

                    {col.cards.map((card, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-lg border transition-all"
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          border: "1px solid",
                          background: card.done ? "#F9FAFB" : "#FFFFFF",
                          borderColor: card.done ? "rgba(15,23,42,0.06)" : "rgba(15,23,42,0.09)",
                          opacity: card.done ? 0.65 : 1,
                        }}
                      >
                        <div
                          className="flex items-center justify-between mb-2 gap-1"
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 4 }}
                        >
                          <span
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                            style={{
                              fontSize: 9,
                              fontWeight: 500,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: card.tagBg,
                              color: card.tagFg,
                            }}
                          >
                            {card.tag}
                          </span>
                          {card.done ? (
                            <CircleCheck size={12} style={{ color: "#10b981" }} />
                          ) : card.priority ? (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-md"
                              style={{
                                fontSize: 9,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: card.pBg,
                                color: card.pFg,
                              }}
                            >
                              {card.priority}
                            </span>
                          ) : null}
                        </div>

                        <p
                          className={`text-[10px] leading-snug font-medium ${card.done ? "line-through" : ""}`}
                          style={{
                            fontSize: 10,
                            lineHeight: 1.375,
                            fontWeight: 500,
                            textDecoration: card.done ? "line-through" : "none",
                            color: card.done ? "#94A3B8" : "#334155",
                          }}
                        >
                          {card.label}
                        </p>

                        {card.progress !== undefined && (
                          <div className="mt-2" style={{ marginTop: 8 }}>
                            <div
                              className="h-1 rounded-full overflow-hidden"
                              style={{ height: 4, borderRadius: 999, overflow: "hidden", background: "rgba(15,23,42,0.07)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  height: "100%",
                                  borderRadius: 999,
                                  width: `${card.progress}%`,
                                  background: "linear-gradient(90deg,#334155,#4D9972)",
                                }}
                              />
                            </div>
                            <p className="text-[9px] mt-1" style={{ fontSize: 9, marginTop: 4, color: "#94A3B8" }}>
                              {card.progress}% complété
                            </p>
                          </div>
                        )}

                        {card.done && card.closedAt && (
                          <p className="text-[9px] mt-1.5" style={{ fontSize: 9, marginTop: 6, color: "#94A3B8" }}>
                            {card.closedAt}
                          </p>
                        )}

                        {!card.done && card.assignee && (
                          <div
                            className="flex items-center justify-between mt-2"
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}
                          >
                            <span className="text-[9px] flex items-center gap-1" style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 4, color: "#94A3B8" }}>
                              <Clock size={10} /> Demain
                            </span>
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 8,
                                fontWeight: 700,
                                color: "#fff",
                                background: card.ava,
                              }}
                            >
                              {card.assignee}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div
        className="border-y overflow-hidden py-3.5 z-10 relative"
        style={{
          borderTop: "1px solid rgba(15,23,42,0.07)",
          borderBottom: "1px solid rgba(15,23,42,0.07)",
          overflow: "hidden",
          padding: "14px 0",
          background: "#F0F2F5",
          zIndex: 10,
          position: "relative",
        }}
      >
        <div className="flex whitespace-nowrap animate-marquee" style={{ display: "flex", width: "max-content", whiteSpace: "nowrap" }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-4 px-6" style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
              <span className="text-[11px] font-mono uppercase tracking-[0.14em]" style={{ fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.14em", color: "#64748B" }}>
                {item}
              </span>
              <span style={{ color: "#CBD5E1" }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── 00 — POURQUOI COFLOW ── */}
      <section id="why" className="relative z-10 max-w-screen-xl mx-auto px-6 py-28" style={{ position: "relative", zIndex: 10, padding: "112px 24px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start" style={{ display: "grid", alignItems: "flex-start" }}>
          <div className="lg:sticky lg:top-24" style={{ position: "sticky", top: 96 }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-6" style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 24, color: "#3B805C" }}>
              00 — Pourquoi CoFlow
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] leading-tight" style={{ fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.25, color: "#1E293B" }}>
              On a construit l’outil<br />
              qu’on cherchait<br />
              sans trouver.
            </h2>
            <p className="mt-6 text-sm leading-relaxed max-w-sm" style={{ marginTop: 24, fontSize: 14, lineHeight: 1.625, maxWidth: 384, color: "#334155" }}>
              Jira est trop lourd. Trello manque de contexte. Notion, c’est un éditeur de texte déguisé. Asana coûte trop cher. On a donc construit CoFlow — focus sur l’essentiel, zéro friction.
            </p>
          </div>

          <div className="space-y-0" style={{ display: "flex", flexDirection: "column" }}>
            {[
              { removed: true, text: "Des dizaines de modules que personne n’active" },
              { removed: false, text: "Un kanban fluide avec les infos qui comptent" },
              { removed: true, text: "Des rapports générés pour remplir des slides" },
              { removed: false, text: "Une progression calculée en temps réel depuis vos tâches" },
              { removed: true, text: "Des réunions pour parler de l’avancement" },
              { removed: false, text: "Une vision globale accessible en un clic" },
              { removed: true, text: "Six outils distincts pour un seul projet" },
              { removed: false, text: "Un seul espace, tous vos projets, toute votre équipe" },
            ].map((row, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 py-4 border-b"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(15,23,42,0.07)",
                }}
              >
                <span
                  className="text-sm font-mono shrink-0 mt-0.5"
                  style={{
                    fontSize: 14,
                    fontFamily: "monospace",
                    flexShrink: 0,
                    marginTop: 2,
                    color: row.removed ? "#CBD5E1" : "#3B805C",
                  }}
                >
                  {row.removed ? "✕" : "✓"}
                </span>
                <p
                  className={`text-sm leading-relaxed ${row.removed ? "line-through" : ""}`}
                  style={{
                    fontSize: 14,
                    lineHeight: 1.625,
                    textDecoration: row.removed ? "line-through" : "none",
                    color: row.removed ? "#64748B" : "#0F172A",
                  }}
                >
                  {row.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 01 — FONCTIONNALITÉS ── */}
      <section
        id="features"
        className="relative z-10 border-t"
        style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(15,23,42,0.07)", background: "#F0F2F5" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-24" style={{ padding: "96px 24px" }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-20" style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 80, color: "#3B805C" }}>
            01 — Fonctionnalités
          </p>

          <div className="space-y-0" style={{ display: "flex", flexDirection: "column" }}>
            {[
              {
                n: "01",
                title: "Multi-workspaces cloisonnés",
                desc: "Un workspace par client, par département, par projet. Les droits sont granulaires — un membre peut voir un espace sans en voir un autre. Aucune donnée ne fuite.",
                accent: "#334155",
              },
              {
                n: "02",
                title: "Kanban fluide sans distraction",
                desc: "Glissez vos cartes entre les colonnes. Filtrez par priorité, assigné ou statut. Pas de rechargement, pas d'attente. L'interface réagit à la vitesse de votre pensée.",
                accent: "#4D9972",
              },
              {
                n: "03",
                title: "Progression automatique calculée",
                desc: "Chaque tâche accomplie met à jour la jauge du projet. En un coup d'œil, vous savez où en est le sprint sans ouvrir un seul tableur.",
                accent: "#D97706",
              },
              {
                n: "04",
                title: "Invitations instantanées & sécurisées",
                desc: "Générez un lien d'invitation avec un rôle précis (Admin, Membre, Lecteur). Votre collaborateur rejoint le workspace en quelques clics.",
                accent: "#334155",
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 py-10 border-b cursor-pointer group"
                style={{
                  display: "grid",
                  padding: "40px 0",
                  borderBottom: "1px solid rgba(15,23,42,0.07)",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="flex items-start gap-4" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <span
                    className="font-mono text-5xl font-bold leading-none transition-all duration-300"
                    style={{
                      fontFamily: "monospace",
                      fontSize: 48,
                      fontWeight: 700,
                      lineHeight: 1,
                      transition: "all 0.3s ease",
                      color: hoveredFeature === idx ? feat.accent : "rgba(15,23,42,0.12)",
                    }}
                  >
                    {feat.n}
                  </span>
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold mb-3 transition-colors duration-200"
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 12,
                      transition: "color 0.2s ease",
                      color: hoveredFeature === idx ? "#0F172A" : "#334155",
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed max-w-lg transition-colors duration-200"
                    style={{
                      fontSize: 14,
                      lineHeight: 1.625,
                      maxWidth: 512,
                      transition: "color 0.2s ease",
                      color: hoveredFeature === idx ? "#0F172A" : "#475569",
                    }}
                  >
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        className="relative z-10 border-t"
        style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(15,23,42,0.07)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-28" style={{ padding: "112px 24px" }}>
          <blockquote>
            <p
              className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] leading-tight max-w-4xl"
              style={{
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.25,
                maxWidth: 896,
                color: "#1E293B",
              }}
            >
              “CoFlow a remplacé trois outils chez nous.<br />
              <span style={{ color: "#3B805C" }}>Les réunions de cadrage ont été divisées par deux.</span>”
            </p>
            <footer className="mt-8 flex items-center gap-4" style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 16 }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  background: "#334155",
                }}
              >
                SM
              </div>
              <div>
                <p className="text-sm font-medium" style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
                  Sarah Miller
                </p>
                <p className="text-xs font-mono" style={{ fontSize: 12, fontFamily: "monospace", color: "#475569" }}>
                  Head of Product, PixelNova
                </p>
              </div>
            </footer>
          </blockquote>

          <div
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t"
            style={{
              marginTop: 64,
              display: "grid",
              gap: 32,
              paddingTop: 48,
              borderTop: "1px solid rgba(15,23,42,0.07)",
            }}
          >
            <div>
              <p className="text-sm leading-relaxed" style={{ fontSize: 14, lineHeight: 1.625, color: "#334155" }}>
                “L'interface est rapide, propre, sans distraction. C'est exactement ce qu'on cherchait pour notre équipe de développeurs.”
              </p>
              <p className="mt-4 font-mono text-[11px]" style={{ marginTop: 16, fontFamily: "monospace", fontSize: 11, color: "#475569", fontWeight: 600 }}>
                Thomas Garnier — CTO, NexGen Studio
              </p>
            </div>
            <div>
              <p className="text-sm leading-relaxed" style={{ fontSize: 14, lineHeight: 1.625, color: "#334155" }}>
                “La gestion multi-workspaces nous permet d'inviter nos clients directement sans compromettre la confidentialité des autres projets.”
              </p>
              <p className="mt-4 font-mono text-[11px]" style={{ marginTop: 16, fontFamily: "monospace", fontSize: 11, color: "#475569", fontWeight: 600 }}>
                Camille Roux — Fondatrice, ScaleAgency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 — TARIFS ── */}
      <section
        id="pricing"
        className="relative z-10 border-t"
        style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(15,23,42,0.07)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-24" style={{ padding: "96px 24px" }}>
          <div
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
            style={{ display: "flex", gap: 24, marginBottom: 56 }}
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16, color: "#3B805C" }}>
                02 — Tarifs
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em]" style={{ fontWeight: 700, letterSpacing: "-0.03em", color: "#1E293B" }}>
                Honnête et sans surprise.
              </h2>
            </div>

            <div
              className="inline-flex items-center gap-1 p-1 rounded-lg self-start"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: 4,
                borderRadius: 8,
                background: "rgba(15,23,42,0.04)",
                border: "1px solid rgba(15,23,42,0.10)",
                alignSelf: "flex-start",
              }}
            >
              <button
                onClick={() => setIsAnnual(false)}
                className="px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-all"
                style={{
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isAnnual ? "transparent" : "#334155",
                  color: isAnnual ? "#475569" : "#fff",
                }}
              >
                Mensuel
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className="px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-all flex items-center gap-2"
                style={{
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isAnnual ? "#334155" : "transparent",
                  color: isAnnual ? "#fff" : "#475569",
                }}
              >
                <span>Annuel</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 999,
                    fontWeight: 700,
                    background: "rgba(77,153,114,0.12)",
                    color: "#2D6A4F",
                  }}
                >
                  −20%
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-0" style={{ display: "flex", flexDirection: "column" }}>
            {/* Table Header */}
            <div
              className="hidden md:grid grid-cols-[1fr_140px_140px_140px] gap-4 pb-4 border-b text-[11px] font-mono uppercase tracking-[0.12em]"
              style={{
                paddingBottom: 16,
                borderBottom: "1px solid rgba(15,23,42,0.09)",
                fontSize: 11,
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#475569",
                fontWeight: 600,
              }}
            >
              <span>Plan</span>
              <span className="text-center" style={{ textAlign: "center" }}>Starter</span>
              <span className="text-center" style={{ textAlign: "center" }}>Pro</span>
              <span className="text-center" style={{ textAlign: "center" }}>Entreprise</span>
            </div>

            {/* Price Row */}
            <div
              className="hidden md:grid grid-cols-[1fr_140px_140px_140px] gap-4 py-5 border-b items-center"
              style={{
                padding: "20px 0",
                borderBottom: "1px solid rgba(15,23,42,0.07)",
                alignItems: "center",
              }}
            >
              <span className="text-[11px] font-mono" style={{ fontSize: 11, fontFamily: "monospace", color: "#475569", fontWeight: 600 }}>
                Prix / utilisateur
              </span>
              <span className="text-center text-xl font-bold" style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: "#1E293B" }}>
                0€
              </span>
              <span className="text-center" style={{ textAlign: "center" }}>
                <span className="text-xl font-bold" style={{ fontSize: 20, fontWeight: 700, color: "#3B805C" }}>
                  {isAnnual ? "10€" : "12€"}
                </span>
                <span className="text-[11px] font-mono block" style={{ fontSize: 11, fontFamily: "monospace", display: "block", color: "#475569" }}>
                  /mois
                </span>
              </span>
              <span className="text-center text-sm font-semibold" style={{ textAlign: "center", fontSize: 14, color: "#334155" }}>
                Sur mesure
              </span>
            </div>

            {/* Feature comparison rows */}
            {[
              { feature: "Workspaces", starter: "3", pro: "Illimité", enterprise: "Illimité" },
              { feature: "Membres / workspace", starter: "5", pro: "Illimité", enterprise: "Illimité" },
              { feature: "Tableaux Kanban", starter: "Illimité", pro: "Illimité", enterprise: "Illimité" },
              { feature: "Historique des tâches", starter: "30 jours", pro: "Illimité", enterprise: "Illimité" },
              { feature: "Analytics avancées", starter: "—", pro: "✓", enterprise: "✓" },
              { feature: "SSO / SAML", starter: "—", pro: "—", enterprise: "✓" },
              { feature: "SLA garanti", starter: "—", pro: "—", enterprise: "99.9%" },
              { feature: "Support", starter: "Email", pro: "Prioritaire", enterprise: "Dédié" },
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 md:grid-cols-[1fr_140px_140px_140px] gap-4 py-3.5 border-b text-sm items-center"
                style={{
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(15,23,42,0.06)",
                  fontSize: 14,
                  alignItems: "center",
                }}
              >
                <span className="text-[13px] font-medium" style={{ fontSize: 13, color: "#0F172A" }}>
                  {row.feature}
                </span>

                <div className="md:hidden flex flex-col gap-0.5 text-right text-[12px]" style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "right", fontSize: 12, color: "#334155" }}>
                  <span>Starter: {row.starter}</span>
                  <span style={{ color: "#3B805C", fontWeight: 600 }}>Pro: {row.pro}</span>
                  <span>Ent.: {row.enterprise}</span>
                </div>

                <span className="hidden md:block text-center text-[13px]" style={{ textAlign: "center", fontSize: 13, color: row.starter === "—" ? "#CBD5E1" : "#334155" }}>
                  {row.starter}
                </span>
                <span className="hidden md:block text-center text-[13px] font-semibold" style={{ textAlign: "center", fontSize: 13, color: row.pro === "—" ? "#CBD5E1" : "#3B805C" }}>
                  {row.pro}
                </span>
                <span className="hidden md:block text-center text-[13px]" style={{ textAlign: "center", fontSize: 13, color: row.enterprise === "—" ? "#CBD5E1" : "#334155" }}>
                  {row.enterprise}
                </span>
              </div>
            ))}

            {/* Desktop Action Row */}
            <div className="hidden md:grid grid-cols-[1fr_140px_140px_140px] gap-4 pt-6" style={{ paddingTop: 24 }}>
              <span />
              <div className="flex justify-center" style={{ display: "flex", justifyContent: "center" }}>
                <Link href="/sign-up" className="lp-btn-ghost">
                  Commencer
                </Link>
              </div>
              <div className="flex justify-center" style={{ display: "flex", justifyContent: "center" }}>
                <Link href="/sign-up" className="lp-btn-pro">
                  Essayer Pro
                </Link>
              </div>
              <div className="flex justify-center" style={{ display: "flex", justifyContent: "center" }}>
                <Link href="/sign-up" className="lp-btn-ghost">
                  Nous contacter
                </Link>
              </div>
            </div>

            {/* Mobile Action Row */}
            <div className="md:hidden flex flex-col gap-2 pt-6" style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 24 }}>
              <Link href="/sign-up" className="lp-btn-mobile-primary">
                Commencer gratuitement
              </Link>
              <Link href="/sign-up" className="lp-btn-ghost" style={{ justifyContent: "center", width: "100%" }}>
                Voir le plan Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 — FAQ ── */}
      <section
        id="faq"
        className="relative z-10 border-t"
        style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(15,23,42,0.07)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-24" style={{ padding: "96px 24px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16" style={{ display: "grid", gap: 64 }}>
            <div className="lg:sticky lg:top-24 self-start" style={{ position: "sticky", top: 96, alignSelf: "flex-start" }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 16, color: "#3B805C" }}>
                03 — FAQ
              </p>
              <h2 className="text-2xl font-bold tracking-tight" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.025em", color: "#1E293B" }}>
                Questions fréquentes.
              </h2>
              <p className="mt-3 text-sm" style={{ marginTop: 12, fontSize: 14, color: "#334155" }}>
                Autre question ?{" "}
                <Link href="/sign-in" className="underline transition-colors font-semibold" style={{ textDecoration: "underline", color: "#3B805C" }}>
                  Contactez-nous.
                </Link>
              </p>
            </div>

            <div className="space-y-0" style={{ display: "flex", flexDirection: "column" }}>
              {FAQ_ITEMS.map((faq, idx) => (
                <div key={idx} className="border-b" style={{ borderBottom: "1px solid rgba(15,23,42,0.07)" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between py-5 text-left gap-4 transition-colors group"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "20px 0",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      gap: 16,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      className="text-[14px] font-semibold"
                      style={{ fontSize: 14, fontWeight: 600, color: openFaq === idx ? "#0F172A" : "#1E293B" }}
                    >
                      {faq.q}
                    </span>
                    <span className="shrink-0" style={{ flexShrink: 0, color: "#475569" }}>
                      {openFaq === idx ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <p className="pb-5 text-sm leading-relaxed" style={{ paddingBottom: 20, fontSize: 14, lineHeight: 1.625, color: "#334155" }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="relative z-10 border-t"
        style={{
          position: "relative",
          zIndex: 10,
          borderTop: "1px solid #E2E8F0",
          background: "linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-28 text-center" style={{ padding: "112px 24px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: 999,
              background: "rgba(77,153,114,0.12)",
              border: "1px solid rgba(77,153,114,0.25)",
              color: "#3B805C",
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            Prêt à commencer ?
          </div>
          <h2
            className="text-4xl sm:text-6xl font-bold tracking-[-0.04em] leading-[1.05] mb-8"
            style={{
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: 32,
              color: "#0F172A",
            }}
          >
            Moins d'outils.<br />
            Plus de livraisons.
          </h2>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <Link href={isAuthenticated ? "/dashboard" : "/sign-up"} className="lp-btn-final">
              {isAuthenticated ? "Ouvrir mon workspace" : "Démarrer gratuitement"}
              <ArrowRight size={16} className="lp-arrow" />
            </Link>
          </div>
          <p className="mt-4 text-xs font-mono" style={{ marginTop: 16, fontSize: 12.5, fontFamily: "monospace", color: "#475569", fontWeight: 500 }}>
            Sans carte bancaire · Annulation libre · Données hébergées en Europe
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="border-t relative z-10"
        style={{ borderTop: "1px solid #E2E8F0", position: "relative", zIndex: 10, background: "#FFFFFF" }}
      >
        <div
          className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{
            padding: "32px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <Link href="/" className="flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CoFlowLogo size={24} />
            <span className="text-sm font-bold" style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
              Co<span style={{ color: "#3B805C" }}>Flow</span>
            </span>
          </Link>

          <nav
            className="flex flex-wrap items-center justify-center gap-6 text-[13px]"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              fontSize: 13,
              color: "#475569",
              fontWeight: 500,
            }}
          >
            {[
              { label: "Pourquoi CoFlow", href: "#why" },
              { label: "Fonctionnalités", href: "#features" },
              { label: "Tarifs", href: "#pricing" },
              { label: "Connexion", href: "/sign-in" },
              { label: "Inscription", href: "/sign-up" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{ color: "#475569", transition: "color 0.15s", textDecoration: "none" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#0F172A")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#475569")}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <p className="text-[11.5px] font-mono" style={{ fontSize: 11.5, fontFamily: "monospace", color: "#475569" }}>
            © {new Date().getFullYear()} CoFlow · Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}

