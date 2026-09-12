import type { Subscription } from "@prisma/client";

/** Un utilisateur est premium s'il est en essai (non expiré) ou abonné actif. */
export function estPremium(subscription: Subscription | null | undefined): boolean {
  if (!subscription) return false;
  if (subscription.status === "ACTIVE") return true;
  if (subscription.status === "TRIALING" && subscription.trialEndsAt) {
    return subscription.trialEndsAt.getTime() > Date.now();
  }
  return false;
}

export const DUREE_ESSAI_JOURS = 7;
