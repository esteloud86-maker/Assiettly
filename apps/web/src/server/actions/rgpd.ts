"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { requireProfile } from "@/server/auth";

/**
 * Export RGPD (droit à la portabilité) : toutes les données personnelles du
 * profil courant, en JSON. Les champs `Decimal` de Prisma sont convertis en
 * nombres (une action serveur ne peut renvoyer que des valeurs sérialisables
 * au client, pas des instances de classe comme `Decimal`).
 */
export async function exporterMesDonnees() {
  const profile = await requireProfile();

  const [meals, weightLogs, streakDays, pushSubscriptions, foodAnalysisLogs] = await Promise.all([
    prisma.meal.findMany({
      where: { profileId: profile.id },
      include: { items: { include: { food: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.weightLog.findMany({ where: { profileId: profile.id }, orderBy: { date: "asc" } }),
    prisma.streakDay.findMany({ where: { profileId: profile.id }, orderBy: { date: "asc" } }),
    prisma.pushSubscription.findMany({ where: { profileId: profile.id } }),
    prisma.foodAnalysisLog.findMany({ where: { profileId: profile.id }, orderBy: { createdAt: "asc" } }),
  ]);

  return {
    exporteLe: new Date().toISOString(),
    profil: {
      email: profile.email,
      nom: profile.nom,
      dateNaissance: profile.dateNaissance?.toISOString().slice(0, 10) ?? null,
      sexe: profile.sexe,
      tailleCm: profile.tailleCm,
      poidsCibleKg: profile.poidsCibleKg ? Number(profile.poidsCibleKg) : null,
      niveauActivite: profile.niveauActivite,
      objectifType: profile.objectifType,
      dejaUtiliseAppSuivi: profile.dejaUtiliseAppSuivi,
      suiviParCoach: profile.suiviParCoach,
      freins: profile.freins,
      typeAlimentation: profile.typeAlimentation,
      motivationPrincipale: profile.motivationPrincipale,
      compteCreeLe: profile.createdAt.toISOString(),
    },
    objectifsCaloriques: profile.goals.map((g) => ({
      objectifCaloriesKcal: g.objectifCaloriesKcal,
      objectifProteinesG: g.objectifProteinesG,
      objectifGlucidesG: g.objectifGlucidesG,
      objectifLipidesG: g.objectifLipidesG,
      actif: g.actif,
      actifDepuis: g.actifDepuis.toISOString(),
    })),
    abonnement: profile.subscription
      ? {
          statut: profile.subscription.status,
          finEssai: profile.subscription.trialEndsAt?.toISOString() ?? null,
          finPeriodeActuelle: profile.subscription.currentPeriodEnd?.toISOString() ?? null,
          resiliationProgrammee: profile.subscription.cancelAtPeriodEnd,
        }
      : null,
    poids: weightLogs.map((w) => ({ date: w.date.toISOString().slice(0, 10), poidsKg: Number(w.poidsKg) })),
    repas: meals.map((m) => ({
      date: m.date.toISOString().slice(0, 10),
      type: m.type,
      aliments: m.items.map((it) => ({
        nom: it.food?.nom ?? it.nomLibre ?? null,
        quantiteG: Number(it.quantiteG),
        caloriesKcal: Number(it.caloriesKcal),
        proteinesG: Number(it.proteinesG),
        glucidesG: Number(it.glucidesG),
        lipidesG: Number(it.lipidesG),
        fibresG: it.fibresG ? Number(it.fibresG) : null,
      })),
    })),
    streak: {
      resume: profile.streakSummary
        ? {
            streakActuel: profile.streakSummary.streakActuel,
            streakMax: profile.streakSummary.streakMax,
            freezesUtilisesMois: profile.streakSummary.freezesUtilisesMois,
          }
        : null,
      jours: streakDays.map((j) => ({
        date: j.date.toISOString().slice(0, 10),
        flammeAllumee: j.flammeAllumee,
        freezeUtilise: j.freezeUtilise,
        caloriesJour: j.caloriesJour,
        objectifRespecte: j.objectifRespecte,
      })),
    },
    // Les analyses de repas par photo ne conservent jamais l'image elle-même
    // (minimisation des données), seulement des métadonnées techniques.
    analysesPhotos: foodAnalysisLogs.map((log) => ({
      date: log.createdAt.toISOString(),
      confianceGlobale: log.confianceGlobale,
      nombreIngredients: log.nombreIngredients,
      echec: log.erreur !== null,
    })),
    notificationsPushActives: pushSubscriptions.length,
  };
}

/**
 * Droit à l'effacement RGPD : annule l'abonnement Stripe en cours (sans
 * attendre la fin de la période déjà payée — l'utilisateur demande une
 * suppression, pas un simple non-renouvellement), supprime le compte
 * d'authentification Supabase si la clé `SUPABASE_SERVICE_ROLE_KEY` est
 * configurée, puis supprime le profil Prisma — ce qui supprime en cascade
 * repas, poids, streaks, objectifs, abonnement et abonnements push (cf.
 * `onDelete: Cascade` dans le schéma).
 *
 * Si la clé service_role n'est pas configurée (ex: environnement local),
 * toutes les données applicatives sont bien supprimées mais le compte
 * Supabase Auth reste actif : à documenter clairement dans l'interface tant
 * que cette clé n'est pas renseignée en production.
 */
export async function supprimerMonCompte() {
  const profile = await requireProfile();
  const supabase = createClient();

  if (profile.stripeCustomerId) {
    try {
      const abonnements = await stripe.subscriptions.list({ customer: profile.stripeCustomerId, status: "all" });
      await Promise.all(
        abonnements.data
          .filter((a) => a.status !== "canceled")
          .map((a) => stripe.subscriptions.cancel(a.id)),
      );
    } catch (erreur) {
      // On ne bloque jamais une demande de suppression de compte sur un
      // échec de facturation (client Stripe déjà supprimé, réseau, etc.) —
      // l'utilisateur a un droit à l'effacement, l'éventuel abonnement
      // orphelin sera de toute façon sans profil pour le réactiver.
      console.error("Échec de l'annulation de l'abonnement Stripe lors de la suppression de compte", erreur);
    }
  }

  const admin = creerClientAdmin();
  if (admin) {
    const { error } = await admin.auth.admin.deleteUser(profile.id);
    if (error) {
      console.error("Échec de la suppression du compte Supabase Auth", error);
    }
  }

  await prisma.profile.delete({ where: { id: profile.id } });

  await supabase.auth.signOut();
  redirect("/");
}
