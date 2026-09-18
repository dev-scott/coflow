"use client";

import React, { useId } from "react";

export interface BloomLogoProps {
  /** Size in pixels. Default 36. */
  size?: number;
  /** Extra CSS class names. */
  className?: string;
  /** Optional: include the styled "Bloom" wordmark alongside the logo. */
  withText?: boolean;
}

/**
 * Bloom Brand Logo — "The Geometric Blossom"
 *
 * Emblème géométrique en éclosion radiale, incarnant la croissance, la vitalité
 * et l'harmonie d'équipe.
 *
 * - Symétrie mathématique totale (radiale d'ordre 4 & axiale bilatérale).
 * - 4 pétales majeurs orthogonaux aux dégradés Vert Forêt & Émeraude (#1B4332 -> #2D6A4F -> #4D9972).
 * - 4 corolles d'éclosion diagonales en Sauge radiant (#6BAF8A -> #A7F3D0).
 * - Cœur central perlé de collaboration.
 * - Écrin squircle satiné aux finitions Apple/Figma.
 */
export function BloomLogo({
  size = 36,
  className = "",
  withText = false,
}: BloomLogoProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");

  const iconSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
      aria-label="Bloom"
    >
      <defs>
        {/* Ombre d'élévation douce du squircle */}
        <filter id={`tileShadow${uid}`} x="-10%" y="-10%" width="125%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.08" />
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#0F172A" floodOpacity="0.04" />
        </filter>

        {/* Ombre de profondeur des pétales */}
        <filter id={`petalDepth${uid}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0F291E" floodOpacity="0.16" />
        </filter>

        {/* Dégradé Pétales Verticaux (Forêt vers Sauge) */}
        <linearGradient id={`petalV${uid}`} x1="50" y1="18" x2="50" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2D6A4F" />
          <stop offset="50%" stopColor="#1B4332" />
          <stop offset="100%" stopColor="#2D6A4F" />
        </linearGradient>

        {/* Dégradé Pétales Horizontaux (Émeraude vers Sauge lumineux) */}
        <linearGradient id={`petalH${uid}`} x1="18" y1="50" x2="82" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#52A77A" />
          <stop offset="50%" stopColor="#366B50" />
          <stop offset="100%" stopColor="#52A77A" />
        </linearGradient>

        {/* Dégradé Pétales Diagonaux (Lumière d'éclosion) */}
        <linearGradient id={`petalDiag${uid}`} x1="28" y1="28" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7CCBA2" />
          <stop offset="100%" stopColor="#3E8662" />
        </linearGradient>

        {/* Reflet satiné sur le squircle blanc */}
        <linearGradient id={`tileSheen${uid}`} x1="50" y1="3" x2="50" y2="97" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>

      {/* ── 1. Conteneur Squircle Blanc Satiné ── */}
      <g filter={`url(#tileShadow${uid})`}>
        <rect x="3.5" y="3.5" width="93" height="93" rx="24" fill={`url(#tileSheen${uid})`} />
        <rect x="3.5" y="3.5" width="93" height="93" rx="24" stroke="rgba(226, 232, 240, 0.9)" strokeWidth="1" />
      </g>

      <g filter={`url(#petalDepth${uid})`}>
        {/* ── 2. Pétales Diagonaux Radiaux (Éclosion aux 4 coins) ── */}
        <path
          d="M 28 28 C 39 33 45 42 50 50 C 42 45 33 39 28 28 Z"
          fill={`url(#petalDiag${uid})`}
          opacity="0.78"
        />
        <path
          d="M 72 72 C 61 67 55 58 50 50 C 58 55 67 61 72 72 Z"
          fill={`url(#petalDiag${uid})`}
          opacity="0.78"
        />
        <path
          d="M 72 28 C 67 39 58 45 50 50 C 55 42 61 33 72 28 Z"
          fill={`url(#petalDiag${uid})`}
          opacity="0.78"
        />
        <path
          d="M 28 72 C 33 61 42 55 50 50 C 45 58 39 67 28 72 Z"
          fill={`url(#petalDiag${uid})`}
          opacity="0.78"
        />

        {/* ── 3. Pétales Majeurs Verticaux (Axe Y) — Symétrie parfaite ── */}
        <path
          d="M 50 17 C 65 30 65 47 50 50 C 35 47 35 30 50 17 Z"
          fill={`url(#petalV${uid})`}
        />
        <path
          d="M 50 83 C 65 70 65 53 50 50 C 35 53 35 70 50 83 Z"
          fill={`url(#petalV${uid})`}
        />

        {/* ── 4. Pétales Majeurs Horizontaux (Axe X) — Symétrie parfaite ── */}
        <path
          d="M 17 50 C 30 35 47 35 50 50 C 47 65 30 65 17 50 Z"
          fill={`url(#petalH${uid})`}
          opacity="0.94"
        />
        <path
          d="M 83 50 C 70 35 53 35 50 50 C 53 65 70 65 83 50 Z"
          fill={`url(#petalH${uid})`}
          opacity="0.94"
        />

        {/* ── 5. Cœur de Bourgeon Central (Noyau de collaboration Bloom) ── */}
        <circle cx="50" cy="50" r="5.5" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="3.4" fill="#2D6A4F" />
        <circle cx="50" cy="50" r="1.4" fill="#A7F3D0" />
      </g>
    </svg>
  );

  if (!withText) {
    return (
      <div
        className={className}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        {iconSvg}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: Math.max(8, Math.round(size * 0.28)), flexShrink: 0 }}
    >
      {iconSvg}
      <span
        style={{
          fontFamily: "var(--font-logo), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: Math.round(size * 0.58),
          fontWeight: 800,
          letterSpacing: "-0.035em",
          color: "#0F172A",
          lineHeight: 1,
        }}
      >
        Bl
        <span
          style={{
            background: "linear-gradient(135deg, #2E6047 0%, #4D9972 65%, #6BAF8A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
          }}
        >
          oom
        </span>
      </span>
    </div>
  );
}

// Alias for backward compatibility across existing files
export const CoFlowLogo = BloomLogo;
export type CoFlowLogoProps = BloomLogoProps;

export default BloomLogo;
