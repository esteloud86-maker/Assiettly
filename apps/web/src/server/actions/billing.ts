"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { requireProfile } from "@/server/auth";
import { DUREE_ESSAI_JOURS } from "@/server/billing";

export type FormuleAbonnement = "mensuel" | "annuel";

const PRICE_IDS: Record<FormuleAbonnement, string> = {
  mensuel: process.env.STRIPE_PRICE_ID_MENSUEL!,
  annuel: process.env.STRIPE_PRICE_ID_ANNUEL!,
};

/** Crée une session Stripe Checkout avec 7 jours d'essai gratuit, puis redirige vers Stripe. */
export async function demarrerAbonnement(formule: FormuleAbonnement) {
  const profile = await requireProfile();

  let stripeCustomerId = profile.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { profileId: profile.id },
    });
    stripeCustomerId = customer.id;
    await prisma.profile.update({ where: { id: profile.id }, data: { stripeCustomerId } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: PRICE_IDS[formule], quantity: 1 }],
    subscription_data: {
      trial_period_days: DUREE_ESSAI_JOURS,
      metadata: { profileId: profile.id },
    },
    success_url: `${appUrl}/accueil?abonnement=succes`,
    cancel_url: `${appUrl}/paywall?abonnement=annule`,
    locale: "fr",
  });

  if (!session.url) throw new Error("Impossible de créer la session de paiement Stripe");
  redirect(session.url);
}

/** Redirige vers le portail Stripe pour gérer/annuler l'abonnement. */
export async function ouvrirPortailAbonnement() {
  const profile = await requireProfile();
  if (!profile.stripeCustomerId) throw new Error("Aucun abonnement Stripe pour ce profil");

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profil`,
  });

  redirect(session.url);
}
