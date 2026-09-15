export interface PlanLimits {
  maxWorkspaces: number;
  maxProjectsPerWorkspace: number;
  maxMembersPerWorkspace: number;
  historyDays: number;
}

export const PLAN_LIMITS: Record<"starter" | "pro" | "enterprise", PlanLimits> = {
  starter: {
    maxWorkspaces: 3,
    maxProjectsPerWorkspace: 3,
    maxMembersPerWorkspace: 5,
    historyDays: 30,
  },
  pro: {
    maxWorkspaces: Infinity,
    maxProjectsPerWorkspace: Infinity,
    maxMembersPerWorkspace: Infinity,
    historyDays: Infinity,
  },
  enterprise: {
    maxWorkspaces: Infinity,
    maxProjectsPerWorkspace: Infinity,
    maxMembersPerWorkspace: Infinity,
    historyDays: Infinity,
  },
};

/**
 * Détermine si un utilisateur bénéficie des fonctionnalités Pro ou Entreprise
 * (Abonnement Pro actif, Essai Pro 14j encore valide, ou Plan Entreprise)
 */
export function isUserPro(user: {
  plan?: string;
  planStatus?: string;
  trialEndsAt?: Date | string | null;
} | null | undefined): boolean {
  if (!user) return false;
  if (user.plan === "enterprise") return true;
  if (user.plan === "pro") {
    if (user.planStatus === "active") return true;
    if (user.planStatus === "trialing" && user.trialEndsAt) {
      return new Date(user.trialEndsAt).getTime() > Date.now();
    }
  }
  return false;
}

export function getUserPlan(user: {
  plan?: string;
  planStatus?: string;
  trialEndsAt?: Date | string | null;
} | null | undefined): "starter" | "pro" | "enterprise" {
  if (!user) return "starter";
  if (user.plan === "enterprise") return "enterprise";
  if (isUserPro(user)) return "pro";
  return "starter";
}
