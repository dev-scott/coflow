import { useState } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { useAuth } from "@/provider/auth-context";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Menu,
  Minus,
  Plus,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CoFlow — L'outil de projet pour les équipes qui livrent" },
    {
      name: "description",
      content:
        "CoFlow centralise vos workspaces, vos kanbans et vos indicateurs d'avancement. Pas de modules superflus. Pas de réunions pour parler de réunions.",
    },
  ];
}

const FAQS = [
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

const TICKER_ITEMS = [
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

export default function Homepage() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [annual, setAnnual] = useState(true);
  const [activeCol, setActiveCol] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen overflow-x-hidden font-sans antialiased"
      style={{ background: "#05050a", color: "#e8e8f0" }}
    >
      {/* ── Subtle noise / grain texture ─────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* ── NAV ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "rgba(5,5,10,0.92)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
            >
              <Zap className="w-3.5 h-3.5 text-white" fill="white" />
            </div>
            <span
              className="font-bold text-sm tracking-tight"
              style={{ color: "#e8e8f0" }}
            >
              CoFlow
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 ml-6 text-[13px]" style={{ color: "#888" }}>
            {[
              { label: "Pourquoi CoFlow", href: "#why" },
              { label: "Fonctionnalités", href: "#features" },
              { label: "Tarifs", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors duration-150">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto hidden sm:flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="lp-btn-nav">
                Mon workspace <ArrowRight className="w-3.5 h-3.5 lp-arrow" />
              </Link>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className="text-[13px] transition-colors"
                  style={{ color: "#666" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#e8e8f0")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
                >
                  Connexion
                </Link>
                <Link to="/sign-up" className="lp-btn-nav">
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-auto md:hidden p-1.5"
            style={{ color: "#888" }}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div
            className="md:hidden px-6 pt-3 pb-6 border-t space-y-1"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(5,5,10,0.98)" }}
          >
            {[
              { label: "Pourquoi CoFlow", href: "#why" },
              { label: "Fonctionnalités", href: "#features" },
              { label: "Tarifs", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm"
                style={{ color: "#888" }}
              >
                {l.label}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {isAuthenticated ? (
                <Link to="/dashboard" className="lp-btn-mobile-primary">
                  Mon workspace
                </Link>
              ) : (
                <>
                  <Link to="/sign-in" className="text-center py-2 text-sm" style={{ color: "#666" }}>
                    Connexion
                  </Link>
                  <Link to="/sign-up" className="lp-btn-mobile-primary">
                    Commencer gratuitement
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── HERO — asymmetric, left-anchored ─────────────────── */}
      <section className="relative max-w-screen-xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 z-10">
        {/* Tiny label top-left */}
        <p
          className="font-mono text-[11px] uppercase tracking-[0.18em] mb-8"
          style={{ color: "#555" }}
        >
          v2.0 — Gestion de projet
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
          {/* Left column: title + CTAs */}
          <div>
            <h1
              className="font-bold leading-[1.03] tracking-[-0.04em] text-[3.2rem] sm:text-[4.5rem] lg:text-[5.5rem]"
              style={{ color: "#e8e8f0" }}
            >
              Votre équipe
              <br />
              mérite mieux
              <br />
              <span
                className="italic"
                style={{
                  background: "linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                qu'un tableau
              </span>
              <br />
              <span style={{ color: "#e8e8f0" }}>Excel.</span>
            </h1>

            <p
              className="mt-8 text-base leading-relaxed max-w-md"
              style={{ color: "#888" }}
            >
              CoFlow met vos projets, vos tâches et vos collaborateurs dans un
              seul endroit — sans vous noyer sous les fonctionnalités que
              personne n&apos;utilise.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                to={isAuthenticated ? "/dashboard" : "/sign-up"}
                className="lp-btn-primary"
              >
                {isAuthenticated ? "Ouvrir mon workspace" : "Démarrer — c'est gratuit"}
                <ArrowRight className="w-4 h-4 lp-arrow" />
              </Link>
              <a href="#why" className="lp-text-link">
                En savoir plus
                <span className="lp-text-arrow">→</span>
              </a>
            </div>

            {/* Minimal trust row */}
            <div
              className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-mono"
              style={{ color: "#444" }}
            >
              <span>→ Aucune carte bancaire</span>
              <span>→ Setup en 30 secondes</span>
              <span>→ Données hébergées en Europe</span>
            </div>
          </div>

          {/* Right column: kanban preview */}
          <div id="preview" className="relative mt-4 lg:mt-0">
            {/* Subtle violet glow behind card */}
            <div
              aria-hidden
              className="absolute -inset-4 rounded-3xl blur-3xl -z-10 opacity-20"
              style={{ background: "radial-gradient(circle at 50% 50%, #7c3aed, transparent 70%)" }}
            />
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "#0d0d16",
              }}
            >
              {/* Fake window bar */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a12" }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
                <span
                  className="ml-3 font-mono text-[11px]"
                  style={{ color: "#444" }}
                >
                  coflow.app / ws / core-platform
                </span>
              </div>

              {/* Kanban columns */}
              <div className="p-4 grid grid-cols-3 gap-3">
                {([
                  {
                    title: "À faire",
                    dot: "#64748b",
                    cards: [
                      { label: "Refactoriser Header", tag: "Frontend", tagBg: "rgba(59,130,246,0.12)", tagFg: "#60a5fa", priority: "Moyenne", pBg: "rgba(245,158,11,0.12)", pFg: "#fbbf24", assignee: "AL", ava: "#7c3aed" },
                      { label: "Maquettes Dark Mode", tag: "Design", tagBg: "rgba(236,72,153,0.12)", tagFg: "#f472b6", priority: "Haute", pBg: "rgba(239,68,68,0.12)", pFg: "#f87171", assignee: "SC", ava: "#0891b2" },
                    ],
                  },
                  {
                    title: "En cours",
                    dot: "#7c3aed",
                    pulse: true,
                    cards: [
                      { label: "Flux invitation sécurisé", tag: "Auth", tagBg: "rgba(16,185,129,0.12)", tagFg: "#34d399", priority: "Haute", pBg: "rgba(239,68,68,0.12)", pFg: "#f87171", assignee: "ML", ava: "#4f46e5", progress: 70 },
                      { label: "Graphiques de vélocité", tag: "Analytics", tagBg: "rgba(139,92,246,0.12)", tagFg: "#a78bfa", priority: "Basse", pBg: "rgba(100,116,139,0.12)", pFg: "#94a3b8", assignee: "ED", ava: "#b45309" },
                    ],
                  },
                  {
                    title: "Terminé",
                    dot: "#10b981",
                    cards: [
                      { label: "Migration React 19", tag: "Infra", tagBg: "rgba(100,116,139,0.1)", tagFg: "#64748b", done: true, closedAt: "Il y a 2h" },
                      { label: "Auth JWT & sessions", tag: "Auth", tagBg: "rgba(100,116,139,0.1)", tagFg: "#64748b", done: true, closedAt: "Hier" },
                    ],
                  },
                ] as PreviewColumn[]).map((col, ci) => (
                  <div key={ci} className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-1.5 mb-1 pb-2 border-b"
                      style={{ borderColor: "rgba(255,255,255,0.05)" }}
                    >
                      <span
                        className={cn("w-2 h-2 rounded-full", col.pulse && "animate-pulse")}
                        style={{ background: col.dot }}
                      />
                      <span className="text-[10px] font-medium" style={{ color: "#aaa" }}>
                        {col.title}
                      </span>
                    </div>
                    {col.cards.map((card, ki) => (
                      <div
                        key={ki}
                        className="p-2.5 rounded-lg border transition-all"
                        style={{
                          background: card.done ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.035)",
                          borderColor: card.done ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)",
                          opacity: card.done ? 0.55 : 1,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2 gap-1">
                          <span
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                            style={{ background: card.tagBg, color: card.tagFg }}
                          >
                            {card.tag}
                          </span>
                          {card.done ? (
                            <CheckCircle2 className="w-3 h-3" style={{ color: "#10b981" }} />
                          ) : card.priority ? (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-md"
                              style={{ background: card.pBg, color: card.pFg }}
                            >
                              {card.priority}
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={cn("text-[10px] leading-snug font-medium", card.done && "line-through")}
                          style={{ color: card.done ? "#444" : "#ccc" }}
                        >
                          {card.label}
                        </p>
                        {card.progress !== undefined && (
                          <div className="mt-2">
                            <div
                              className="h-1 rounded-full overflow-hidden"
                              style={{ background: "rgba(255,255,255,0.06)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${card.progress}%`,
                                  background: "linear-gradient(90deg,#7c3aed,#3b82f6)",
                                }}
                              />
                            </div>
                            <p className="text-[9px] mt-1" style={{ color: "#555" }}>
                              {card.progress}% complété
                            </p>
                          </div>
                        )}
                        {card.done && card.closedAt && (
                          <p className="text-[9px] mt-1.5" style={{ color: "#444" }}>
                            {card.closedAt}
                          </p>
                        )}
                        {!card.done && card.assignee && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[9px] flex items-center gap-1" style={{ color: "#444" }}>
                              <Clock className="w-2.5 h-2.5" /> Demain
                            </span>
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                              style={{ background: card.ava }}
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

      {/* ── SCROLLING TICKER ─────────────────────────────────── */}
      <div
        className="border-y overflow-hidden py-3.5 z-10 relative"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="flex whitespace-nowrap animate-marquee" style={{ width: "max-content" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-6">
              <span className="text-[11px] font-mono uppercase tracking-[0.14em]" style={{ color: "#444" }}>
                {item}
              </span>
              <span style={{ color: "#222" }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── WHY — editorial two-column ───────────────────────── */}
      <section id="why" className="relative z-10 max-w-screen-xl mx-auto px-6 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: statement */}
          <div className="lg:sticky lg:top-24">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.18em] mb-6"
              style={{ color: "#555" }}
            >
              00 — Pourquoi CoFlow
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] leading-tight"
              style={{ color: "#e8e8f0" }}
            >
              On a construit l&apos;outil
              <br />
              qu&apos;on cherchait
              <br />
              sans trouver.
            </h2>
            <p className="mt-6 text-sm leading-relaxed max-w-sm" style={{ color: "#666" }}>
              Jira est trop lourd. Trello manque de contexte. Notion, c&apos;est un
              éditeur de texte déguisé. Asana coûte trop cher. On a donc construit
              CoFlow — focus sur l&apos;essentiel, zéro friction.
            </p>
          </div>

          {/* Right: contrasted list — strikethrough vs checkmark */}
          <div className="space-y-0">
            {([
              { removed: true, text: "Des dizaines de modules que personne n'active" },
              { removed: false, text: "Un kanban fluide avec les infos qui comptent" },
              { removed: true, text: "Des rapports générés pour remplir des slides" },
              { removed: false, text: "Une progression calculée en temps réel depuis vos tâches" },
              { removed: true, text: "Des réunions pour parler de l'avancement" },
              { removed: false, text: "Une vision globale accessible en un clic" },
              { removed: true, text: "Six outils distincts pour un seul projet" },
              { removed: false, text: "Un seul espace, tous vos projets, toute votre équipe" },
            ] as { removed: boolean; text: string }[]).map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <span
                  className="text-sm font-mono shrink-0 mt-0.5"
                  style={{ color: item.removed ? "#3a3a3a" : "#7c3aed" }}
                >
                  {item.removed ? "✕" : "✓"}
                </span>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    item.removed ? "line-through" : ""
                  )}
                  style={{ color: item.removed ? "#3a3a3a" : "#ccc" }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES — numbered vertical list ────────────────── */}
      <section
        id="features"
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-24">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.18em] mb-20"
            style={{ color: "#555" }}
          >
            01 — Fonctionnalités
          </p>

          <div className="space-y-0">
            {([
              {
                n: "01",
                title: "Multi-workspaces cloisonnés",
                desc: "Un workspace par client, par département, par projet. Les droits sont granulaires — un membre peut voir un espace sans en voir un autre. Aucune donnée ne fuite.",
                accent: "#7c3aed",
              },
              {
                n: "02",
                title: "Kanban sans chargement parasite",
                desc: "Vos colonnes sont configurables. Vos cartes ont un titre, une priorité, une assignation, une échéance et une progression. Tout ce qu'il faut, rien de plus.",
                accent: "#3b82f6",
              },
              {
                n: "03",
                title: "Progression calculée automatiquement",
                desc: "Chaque projet affiche son taux d'avancement en temps réel, calculé depuis le statut de ses tâches. Aucun rapport à remplir manuellement.",
                accent: "#10b981",
              },
              {
                n: "04",
                title: "Collaboration et invitations",
                desc: "Vous invitez un membre par lien. Il rejoint votre workspace en deux clics. Vous lui attribuez un rôle et des tâches. Terminé.",
                accent: "#f59e0b",
              },
            ] as FeatureItem[]).map((f, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 py-10 border-b cursor-pointer group"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
                onMouseEnter={() => setActiveCol(i)}
                onMouseLeave={() => setActiveCol(null)}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="font-mono text-5xl font-bold leading-none transition-all duration-300"
                    style={{
                      color: activeCol === i ? f.accent : "rgba(255,255,255,0.06)",
                    }}
                  >
                    {f.n}
                  </span>
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold mb-3 transition-colors duration-200"
                    style={{ color: activeCol === i ? "#e8e8f0" : "#999" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed max-w-lg transition-colors duration-200"
                    style={{ color: activeCol === i ? "#777" : "#444" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATEMENT — big quote ────────────────────────────── */}
      <section
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-28">
          <blockquote>
            <p
              className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] leading-tight max-w-4xl"
              style={{ color: "#e8e8f0" }}
            >
              &ldquo;CoFlow a remplacé trois outils chez nous.
              <br />
              <span style={{ color: "#444" }}>
                Les réunions de cadrage ont été divisées par deux.
              </span>&rdquo;
            </p>
            <footer className="mt-8 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "#7c3aed" }}
              >
                SM
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#ccc" }}>
                  Sarah Miller
                </p>
                <p className="text-xs font-mono" style={{ color: "#555" }}>
                  Head of Product, PixelNova
                </p>
              </div>
            </footer>
          </blockquote>

          {/* Two more testimonials in smaller text */}
          <div
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div>
              <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
                &ldquo;L&apos;interface est rapide, propre, sans distraction. C&apos;est exactement ce qu&apos;on cherchait pour notre équipe de développeurs.&rdquo;
              </p>
              <p className="mt-4 font-mono text-[11px]" style={{ color: "#444" }}>
                Thomas Garnier — CTO, NexGen Studio
              </p>
            </div>
            <div>
              <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
                &ldquo;La gestion multi-workspaces nous permet d&apos;inviter nos clients directement sans compromettre la confidentialité des autres projets.&rdquo;
              </p>
              <p className="mt-4 font-mono text-[11px]" style={{ color: "#444" }}>
                Camille Roux — Fondatrice, ScaleAgency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING — clean, direct ──────────────────────────── */}
      <section
        id="pricing"
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "#555" }}>
                02 — Tarifs
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em]" style={{ color: "#e8e8f0" }}>
                Honnête et sans surprise.
              </h2>
            </div>
            {/* Billing toggle */}
            <div
              className="inline-flex items-center gap-1 p-1 rounded-lg self-start"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <button
                onClick={() => setAnnual(false)}
                className={cn(
                  "px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-all",
                  !annual ? "text-white" : ""
                )}
                style={{
                  background: !annual ? "#7c3aed" : "transparent",
                  color: !annual ? "#fff" : "#555",
                }}
              >
                Mensuel
              </button>
              <button
                onClick={() => setAnnual(true)}
                className="px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-all flex items-center gap-2"
                style={{
                  background: annual ? "#7c3aed" : "transparent",
                  color: annual ? "#fff" : "#555",
                }}
              >
                Annuel
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(16,185,129,0.2)", color: "#34d399" }}
                >
                  −20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing table — line-based, not cards */}
          <div className="space-y-0">
            {/* Header row */}
            <div
              className="hidden md:grid grid-cols-[1fr_140px_140px_140px] gap-4 pb-4 border-b text-[11px] font-mono uppercase tracking-[0.12em]"
              style={{ borderColor: "rgba(255,255,255,0.07)", color: "#444" }}
            >
              <span>Plan</span>
              <span className="text-center">Starter</span>
              <span className="text-center">Pro</span>
              <span className="text-center">Entreprise</span>
            </div>

            {/* Price row */}
            <div
              className="hidden md:grid grid-cols-[1fr_140px_140px_140px] gap-4 py-5 border-b items-center"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <span className="text-[11px] font-mono" style={{ color: "#555" }}>
                Prix / utilisateur
              </span>
              <span className="text-center text-xl font-bold" style={{ color: "#e8e8f0" }}>
                0€
              </span>
              <span className="text-center">
                <span className="text-xl font-bold" style={{ color: "#a78bfa" }}>
                  {annual ? "10€" : "12€"}
                </span>
                <span className="text-[11px] font-mono block" style={{ color: "#555" }}>
                  /mois
                </span>
              </span>
              <span className="text-center text-sm" style={{ color: "#666" }}>
                Sur mesure
              </span>
            </div>

            {/* Feature rows */}
            {([
              { feature: "Workspaces", starter: "3", pro: "Illimité", enterprise: "Illimité" },
              { feature: "Membres / workspace", starter: "5", pro: "Illimité", enterprise: "Illimité" },
              { feature: "Tableaux Kanban", starter: "Illimité", pro: "Illimité", enterprise: "Illimité" },
              { feature: "Historique des tâches", starter: "30 jours", pro: "Illimité", enterprise: "Illimité" },
              { feature: "Analytics avancées", starter: "—", pro: "✓", enterprise: "✓" },
              { feature: "SSO / SAML", starter: "—", pro: "—", enterprise: "✓" },
              { feature: "SLA garanti", starter: "—", pro: "—", enterprise: "99.9%" },
              { feature: "Support", starter: "Email", pro: "Prioritaire", enterprise: "Dédié" },
            ] as PriceRow[]).map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-2 md:grid-cols-[1fr_140px_140px_140px] gap-4 py-3.5 border-b text-sm items-center"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <span className="text-[13px]" style={{ color: "#666" }}>
                  {row.feature}
                </span>
                {/* Mobile: show all three stacked */}
                <div className="md:hidden flex flex-col gap-0.5 text-right text-[12px]" style={{ color: "#aaa" }}>
                  <span>Starter: {row.starter}</span>
                  <span style={{ color: "#a78bfa" }}>Pro: {row.pro}</span>
                  <span>Ent.: {row.enterprise}</span>
                </div>
                {/* Desktop: three columns */}
                <span
                  className="hidden md:block text-center text-[13px]"
                  style={{ color: row.starter === "—" ? "#333" : "#888" }}
                >
                  {row.starter}
                </span>
                <span
                  className="hidden md:block text-center text-[13px]"
                  style={{ color: row.pro === "—" ? "#333" : "#a78bfa" }}
                >
                  {row.pro}
                </span>
                <span
                  className="hidden md:block text-center text-[13px]"
                  style={{ color: row.enterprise === "—" ? "#333" : "#888" }}
                >
                  {row.enterprise}
                </span>
              </div>
            ))}

            {/* CTA row */}
            <div className="hidden md:grid grid-cols-[1fr_140px_140px_140px] gap-4 pt-6">
              <span />
              <div className="flex justify-center">
                <Link to="/sign-up" className="lp-btn-ghost">
                  Commencer
                </Link>
              </div>
              <div className="flex justify-center">
                <Link to="/sign-up" className="lp-btn-pro">
                  Essayer Pro
                </Link>
              </div>
              <div className="flex justify-center">
                <Link to="/sign-up" className="lp-btn-ghost">
                  Nous contacter
                </Link>
              </div>
            </div>

            {/* Mobile CTAs */}
            <div className="md:hidden flex flex-col gap-2 pt-6">
              <Link to="/sign-up" className="lp-btn-mobile-primary">
                Commencer gratuitement
              </Link>
              <Link to="/sign-up" className="lp-btn-ghost" style={{ justifyContent: "center", width: "100%" }}>
                Voir le plan Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section
        id="faq"
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16">
            <div className="lg:sticky lg:top-24 self-start">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "#555" }}>
                03 — FAQ
              </p>
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#e8e8f0" }}>
                Questions fréquentes.
              </h2>
              <p className="mt-3 text-sm" style={{ color: "#555" }}>
                Autre question ?{" "}
                <Link to="/sign-in" className="underline transition-colors" style={{ color: "#7c3aed" }}>
                  Contactez-nous.
                </Link>
              </p>
            </div>

            <div className="space-y-0">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="border-b"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 text-left gap-4 transition-colors group"
                  >
                    <span
                      className="text-[14px] font-medium"
                      style={{ color: openFaq === i ? "#e8e8f0" : "#aaa" }}
                    >
                      {faq.q}
                    </span>
                    <span className="shrink-0" style={{ color: "#555" }}>
                      {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="pb-5 text-sm leading-relaxed" style={{ color: "#666" }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — minimal and direct ───────────────────── */}
      <section
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-32 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-8" style={{ color: "#555" }}>
            Prêt à commencer ?
          </p>
          <h2
            className="text-4xl sm:text-6xl font-bold tracking-[-0.04em] leading-[1.05] mb-10"
            style={{ color: "#e8e8f0" }}
          >
            Moins d&apos;outils.
            <br />
            Plus de livraisons.
          </h2>
          <Link
            to={isAuthenticated ? "/dashboard" : "/sign-up"}
            className="lp-btn-final"
          >
            {isAuthenticated ? "Ouvrir mon workspace" : "Démarrer gratuitement"}
            <ArrowRight className="w-4 h-4 lp-arrow" />
          </Link>
          <p className="mt-4 text-xs font-mono" style={{ color: "#444" }}>
            Sans carte bancaire · Annulation libre · Données hébergées en Europe
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer
        className="border-t relative z-10"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
            >
              <Zap className="w-3 h-3 text-white" fill="white" />
            </div>
            <span className="text-sm font-semibold" style={{ color: "#666" }}>
              CoFlow
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-5 text-[12px] font-mono" style={{ color: "#444" }}>
            <a href="#why" className="hover:text-white transition-colors">
              Pourquoi CoFlow
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Tarifs
            </a>
            <Link to="/sign-in" className="hover:text-white transition-colors">
              Connexion
            </Link>
            <Link to="/sign-up" className="hover:text-white transition-colors">
              Inscription
            </Link>
          </nav>

          <p className="text-[11px] font-mono" style={{ color: "#333" }}>
            © {new Date().getFullYear()} CoFlow
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Types for local components ─────────────────────────────── */

interface PreviewCard {
  label: string;
  tag: string;
  tagBg: string;
  tagFg: string;
  done?: boolean;
  closedAt?: string;
  priority?: string;
  pBg?: string;
  pFg?: string;
  assignee?: string;
  ava?: string;
  progress?: number;
}

interface PreviewColumn {
  title: string;
  dot: string;
  pulse?: boolean;
  cards: PreviewCard[];
}

interface FeatureItem {
  n: string;
  title: string;
  desc: string;
  accent: string;
}

interface PriceRow {
  feature: string;
  starter: string;
  pro: string;
  enterprise: string;
}
