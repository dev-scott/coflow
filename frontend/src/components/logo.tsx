"use client";

import React, { useId } from "react";

interface CoFlowLogoProps {
  /** Size in pixels. Default 36. */
  size?: number;
  /** Extra CSS class names. */
  className?: string;
}

/**
 * CoFlow Logo — "Le Nœud Collaboratif" (Möbius C-Flow)
 *
 * Deux conduits géométriques entrelacés formant la lettre 'C' et une boucle
 * d'élan infini.
 * - Conduit Ardoise Profonde (#1E293B -> #334155) : la structure, le cadre, l'organisation.
 * - Conduit Vert Sauge (#3B805C -> #5FA882) : le mouvement, l'énergie d'équipe, le flux continu.
 *
 * Design géométrique pur, épuré, sans néon ni artefact IA.
 */
export function CoFlowLogo({ size = 36, className = "" }: CoFlowLogoProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");

  return (
    <div
      className={className}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
        aria-label="CoFlow"
      >
        <defs>
          {/* Slate foundation gradient */}
          <linearGradient id={`slate${uid}`} x1="72" y1="24" x2="24" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="60%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Sage momentum gradient */}
          <linearGradient id={`sage${uid}`} x1="28" y1="76" x2="76" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#366B50" />
            <stop offset="50%" stopColor="#4D9972" />
            <stop offset="100%" stopColor="#7FB99A" />
          </linearGradient>

          {/* Soft shadow for depth */}
          <filter id={`shadow${uid}`} x="0" y="2" width="100" height="98" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Clean white squircle container */}
        <rect x="3" y="3" width="94" height="94" rx="24" fill="#FFFFFF" />
        <rect x="3.5" y="3.5" width="93" height="93" rx="23.5" stroke="#E2E8F0" strokeWidth="1.2" />

        <g filter={`url(#shadow${uid})`}>
          {/* Conduit 1 (Ardoise) : Arche supérieure et colonne structurante (C) */}
          <path
            d="M 73 28 C 46 28 25 33 25 50 C 25 61 31 66 43 66 C 53 66 60 58 60 49"
            stroke={`url(#slate${uid})`}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Conduit 2 (Vert Sauge) : Boucle inférieure dynamique qui s'entrelace */}
          <path
            d="M 27 72 C 54 72 75 67 75 50 C 75 39 69 34 57 34 C 47 34 40 42 40 51"
            stroke={`url(#sage${uid})`}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point d'impulsion central subtil au croisement des deux énergies */}
          <circle cx="50" cy="50" r="3.2" fill="#4D9972" />
        </g>
      </svg>
    </div>
  );
}

export default CoFlowLogo;

