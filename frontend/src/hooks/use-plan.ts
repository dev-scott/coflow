"use client";

import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/lib/fetch-util";

export interface PlanStatusResponse {
  plan?: "starter" | "pro" | "enterprise";
  planStatus?: "active" | "trialing" | "past_due" | "canceled";
  isPro: boolean;
  isProPaid: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isEnterprise: boolean;
  canStartTrial: boolean;
  hasUsedTrial: boolean;
  trialEndsAt?: string | Date;
  daysLeftInTrial: number;
  subscriptionEndsAt?: string | Date;
  paymentReference?: string;
}

/**
 * Hook universel CoFlow pour gérer de manière unifiée et cohérente
 * le statut du plan, l'essai gratuit de 14 jours, et la facturation.
 */
export function usePlan() {
  const { user } = useAuth();

  // Requête légère pour synchronisation serveur
  const { data: serverStatus } = useQuery<PlanStatusResponse>({
    queryKey: ["plan-status"],
    queryFn: () => fetchData<PlanStatusResponse>("/payments/plan-status"),
    enabled: Boolean(user),
    staleTime: 60 * 1000,
  });

  const now = Date.now();
  const plan = user?.plan ?? serverStatus?.plan ?? "starter";
  const planStatus = user?.planStatus ?? serverStatus?.planStatus ?? "active";
  const hasUsedTrial = Boolean(user?.hasUsedTrial ?? serverStatus?.hasUsedTrial);

  const trialEndsDate = user?.trialEndsAt ?? serverStatus?.trialEndsAt;
  const trialEndsTimestamp = trialEndsDate ? new Date(trialEndsDate).getTime() : 0;

  const isEnterprise = plan === "enterprise";
  const isProPaid = plan === "pro" && planStatus === "active";
  const isTrialActive = Boolean(plan === "pro" && planStatus === "trialing" && trialEndsTimestamp > now);
  const isTrialExpired = Boolean(
    (planStatus === "trialing" && trialEndsTimestamp > 0 && trialEndsTimestamp <= now) ||
    (hasUsedTrial && !isProPaid && !isTrialActive && !isEnterprise)
  );

  const isPro = isEnterprise || isProPaid || isTrialActive;

  const daysLeftInTrial = isTrialActive
    ? Math.max(0, Math.ceil((trialEndsTimestamp - now) / (1000 * 60 * 60 * 24)))
    : 0;

  // Jour en cours dans l'essai (ex: 14 jours restants = Jour 1 sur 14)
  const currentTrialDay = isTrialActive ? Math.min(14, Math.max(1, 14 - daysLeftInTrial + 1)) : 0;
  const trialProgressPercent = isTrialActive ? Math.min(100, Math.max(7, Math.round(((14 - daysLeftInTrial) / 14) * 100))) : 0;

  const canStartTrial = !hasUsedTrial && !isPro && !isEnterprise && !trialEndsDate;

  return {
    user,
    plan,
    planStatus,
    isPro,
    isProPaid,
    isTrial: isTrialActive,
    isTrialActive,
    isTrialExpired,
    isEnterprise,
    canStartTrial,
    hasUsedTrial,
    daysLeftInTrial,
    currentTrialDay,
    trialProgressPercent,
    trialEndsAt: trialEndsDate,
    subscriptionEndsAt: user?.subscriptionEndsAt ?? serverStatus?.subscriptionEndsAt,
    paymentReference: user?.paymentReference ?? serverStatus?.paymentReference,
  };
}
