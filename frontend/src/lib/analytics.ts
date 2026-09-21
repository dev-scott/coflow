/**
 * Google Analytics 4 (GA4) Analytics Engine pour Bloom (CoFlow)
 * Permet un suivi complet des interactions, conversions, navigation et actions métiers.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Vérifie si GA est disponible et configuré dans le navigateur.
 */
export const isGAAvailable = (): boolean => {
  return (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    Boolean(GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== "G-XXXXXXXXXX")
  );
};

/**
 * Envoie un pageview à GA4 lors du changement de route.
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === "undefined") return;

  if (isGAAvailable()) {
    window.gtag!("config", GA_MEASUREMENT_ID!, {
      page_path: url,
      page_title: title || (typeof document !== "undefined" ? document.title : undefined),
    });
  } else if (process.env.NODE_ENV === "development") {
    console.debug(`[GA4] Pageview: ${url} (${title || "No Title"})`);
  }
};

/**
 * Envoie un événement personnalisé à GA4.
 */
export const trackEvent = (action: string, params?: Record<string, unknown>) => {
  if (typeof window === "undefined") return;

  if (isGAAvailable()) {
    window.gtag!("event", action, params);
  } else if (process.env.NODE_ENV === "development") {
    console.debug(`[GA4] Event "${action}":`, params || {});
  }
};

/* ─── Événements Métiers Typés ─── */

/**
 * Événements d'Authentification
 */
export const trackAuth = (
  action: "login" | "sign_up" | "logout" | "password_reset_request" | "verify_email",
  params?: { method?: string; email?: string }
) => {
  trackEvent(action, {
    method: params?.method || "email_password",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Événements d'Espace de travail (Workspaces)
 */
export const trackWorkspace = (
  action: "create" | "switch" | "invite_open" | "invite_sent" | "copy_invite_link" | "join",
  params?: { workspaceId?: string; workspaceName?: string; role?: string; memberEmail?: string }
) => {
  trackEvent(`workspace_${action}`, {
    ...params,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Événements de Projets
 */
export const trackProject = (
  action: "create" | "view" | "edit" | "delete",
  params?: { projectId?: string; projectTitle?: string; workspaceId?: string }
) => {
  trackEvent(`project_${action}`, {
    ...params,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Événements de Tâches & Kanban
 */
export const trackTask = (
  action: "create" | "status_change" | "delete" | "view" | "export_csv",
  params?: {
    taskId?: string;
    taskTitle?: string;
    fromStatus?: string;
    toStatus?: string;
    priority?: string;
    projectId?: string;
    taskCount?: number;
  }
) => {
  trackEvent(`task_${action}`, {
    ...params,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Événements de Monétisation et Abonnements
 */
export const trackSubscription = (
  action:
    | "view_pricing_modal"
    | "select_plan"
    | "toggle_interval"
    | "start_trial_click"
    | "initiate_checkout"
    | "payment_success"
    | "payment_failed",
  params?: {
    plan?: "starter" | "pro" | "enterprise";
    interval?: "monthly" | "yearly";
    amount?: number;
    currency?: string;
    channel?: string;
  }
) => {
  trackEvent(`subscription_${action}`, {
    ...params,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Événements d'Engagement & Fonctionnalités (Palette, Recherche, CTA)
 */
export const trackEngagement = (
  feature: "command_palette" | "landing_cta" | "kanban_filter" | "keyboard_shortcut",
  action: string,
  params?: Record<string, unknown>
) => {
  trackEvent(`engagement_${feature}_${action}`, {
    ...params,
    timestamp: new Date().toISOString(),
  });
};
