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
    // Clé d'idempotence stable par profil : si l'utilisateur double-clique
    // (ou si deux requêtes concurrentes arrivent avant que le premier
    // `prisma.profile.update` ne soit visible), Stripe renvoie le même
    // client au lieu d'en créer un second — sans ça, la requête la plus
    // lente écrase `stripeCustomerId` en base avec un client Stripe
    // différent de celui utilisé pour la session de paiement en cours,
    // cassant ensuite le portail d'abonnement.
    const customer = await stripe.customers.create(
      {
        email: profile.email,
        metadata: { profileId: profile.id },
      },
      { idempotencyKey: `stripe-customer-${profile.id}` },
    );
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
