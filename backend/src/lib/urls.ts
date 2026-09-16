import type { Request } from "express";

/**
 * Détermine dynamiquement l'URL de base du frontend :
 * 1. Détecte le header 'Origin' ou 'Referer' de la requête client (ex: https://coflow.dev-scott.me ou http://localhost:3000)
 * 2. Repli vers la variable d'environnement FRONTEND_URL
 * 3. Repli de sécurité par défaut vers https://coflow.dev-scott.me
 */
export function getFrontendBaseUrl(req?: Request): string {
  if (req) {
    const origin = req.get("origin");
    if (origin && (origin.startsWith("http://") || origin.startsWith("https://"))) {
      return origin.replace(/\/$/, "");
    }

    const referer = req.get("referer");
    if (referer) {
      try {
        const parsed = new URL(referer);
        return `${parsed.protocol}//${parsed.host}`;
      } catch {
        // Ignorer l'erreur d'analyse d'URL
      }
    }
  }

  return (process.env.FRONTEND_URL || "https://coflow.dev-scott.me").replace(/\/$/, "");
}
