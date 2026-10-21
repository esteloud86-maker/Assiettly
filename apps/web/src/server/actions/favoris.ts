"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { FAVORIS_RESERVE_PREMIUM } from "@/lib/pricing";
import { requireProfile } from "@/server/auth";
import { estPremium } from "@/server/billing";
import { ajouterRepas, type AjouterRepasInput } from "@/server/actions/meals";
import { aujourdHuiLocal } from "@/lib/date";

class ErreurFavorisPremium extends Error {
  constructor() {
    super("Les favoris sont réservés à Premium.");
    this.name = "ErreurFavorisPremium";
  }
}

function verifierAccesFavoris(premium: boolean) {
  if (FAVORIS_RESERVE_PREMIUM && !premium) throw new ErreurFavorisPremium();
}

/**
 * Enregistre un repas déjà loggé comme favori, pour le "Répéter" en un tap
 * plus tard. Capture un instantané figé des valeurs nutritionnelles (comme
 * `MealItem` les stocke déjà) plutôt qu'une référence vivante aux `Food` —
 * répéter ce favori dans 3 mois donne exactement ce qui a été mangé ce
 * jour-là, pas une valeur recalculée entre-temps.
 */
export async function ajouterFavori(mealId: string, nom: string) {
  const profile = await requireProfile();
  verifierAccesFavoris(estPremium(profile.subscription));

  const meal = await prisma.meal.findUnique({ where: { id: mealId }, include: { items: true } });
  if (!meal || meal.profileId !== profile.id) throw new Error("Repas introuvable");
  if (meal.items.length === 0) throw new Error("Ce repas n'a aucun aliment à enregistrer.");

  const items: AjouterRepasInput["items"] = meal.items.map((it) => ({
    foodId: it.foodId ?? undefined,
    nomLibre: it.nomLibre ?? undefined,
    quantiteG: Number(it.quantiteG),
    caloriesKcal: Number(it.caloriesKcal),
    proteinesG: Number(it.proteinesG),
    glucidesG: Number(it.glucidesG),
    lipidesG: Number(it.lipidesG),
    fibresG: it.fibresG ? Number(it.fibresG) : undefined,
  }));

  const favori = await prisma.repasFavori.create({
    data: { profileId: profile.id, nom: nom.trim() || "Repas favori", type: meal.type, items },
  });

  revalidatePath("/journal/favoris");
  return favori;
}

export async function listerFavoris() {
  const profile = await requireProfile();
  return prisma.repasFavori.findMany({ where: { profileId: profile.id }, orderBy: { createdAt: "desc" } });
}

export async function supprimerFavori(favoriId: string) {
  const profile = await requireProfile();
  const favori = await prisma.repasFavori.findUnique({ where: { id: favoriId } });
  if (!favori || favori.profileId !== profile.id) throw new Error("Favori introuvable");

  await prisma.repasFavori.delete({ where: { id: favoriId } });
  revalidatePath("/journal/favoris");
}

/** "Répéter ce repas" — relogue le favori à la date du jour, en un appel. */
export async function repeterFavori(favoriId: string) {
  const profile = await requireProfile();
  verifierAccesFavoris(estPremium(profile.subscription));

  const favori = await prisma.repasFavori.findUnique({ where: { id: favoriId } });
  if (!favori || favori.profileId !== profile.id) throw new Error("Favori introuvable");

  await ajouterRepas({
    date: aujourdHuiLocal(),
    type: favori.type,
    items: favori.items as AjouterRepasInput["items"],
  });
}
