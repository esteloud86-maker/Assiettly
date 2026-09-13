"use server";

import { createMealSchema } from "@assiettly/shared";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { aujourdHuiLocalCommeDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/server/auth";
import { recupererProduitParCodeBarre } from "@/server/openFoodFacts";
import { recomputerStreakPourJour } from "@/server/streak";

export async function rechercherAliments(q: string) {
  await requireProfile();
  const requete = q.trim();
  if (requete.length < 2) return [];

  return prisma.food.findMany({
    where: { nom: { contains: requete, mode: "insensitive" } },
    orderBy: { nom: "asc" },
    take: 20,
  });
}

export async function chercherParCodeBarre(codeBarre: string) {
  await requireProfile();

  const existant = await prisma.food.findUnique({ where: { codeBarre } });
  if (existant) return existant;

  const produit = await recupererProduitParCodeBarre(codeBarre);
  if (!produit) return null;

  try {
    return await prisma.food.create({
      data: {
        nom: produit.nom,
        marque: produit.marque,
        source: "OPEN_FOOD_FACTS",
        codeBarre,
        caloriesKcal100g: produit.caloriesKcal100g,
        proteinesG100g: produit.proteinesG100g,
        glucidesG100g: produit.glucidesG100g,
        lipidesG100g: produit.lipidesG100g,
        fibresG100g: produit.fibresG100g ?? undefined,
      },
    });
  } catch (erreur) {
    // Deux scans concurrents du même code-barres inédit passent tous les
    // deux le `findUnique` ci-dessus avant qu'aucun n'ait écrit : le second
    // `create` percute la contrainte unique sur `codeBarre` (P2002). Dans ce
    // cas précis on relit l'enregistrement que l'autre appel vient de créer
    // plutôt que de laisser planter l'action.
    if (erreur instanceof Prisma.PrismaClientKnownRequestError && erreur.code === "P2002") {
      const creeParAilleurs = await prisma.food.findUnique({ where: { codeBarre } });
      if (creeParAilleurs) return creeParAilleurs;
    }
    throw erreur;
  }
}

export interface AjouterRepasInput {
  date: string;
  type: "PETIT_DEJ" | "DEJEUNER" | "DINER" | "COLLATION";
  items: {
    foodId?: string;
    nomLibre?: string;
    quantiteG: number;
    caloriesKcal?: number;
    proteinesG?: number;
    glucidesG?: number;
    lipidesG?: number;
    fibresG?: number;
  }[];
}

export async function ajouterRepas(input: AjouterRepasInput) {
  const data = createMealSchema.parse(input);
  const profile = await requireProfile();

  const foodIds = data.items.map((i) => i.foodId).filter((id): id is string => !!id);
  const foods = foodIds.length ? await prisma.food.findMany({ where: { id: { in: foodIds } } }) : [];
  const foodById = new Map(foods.map((f) => [f.id, f]));

  for (const item of data.items) {
    if (!item.foodId && item.caloriesKcal === undefined) {
      throw new Error("Chaque aliment libre (sans foodId) doit fournir ses valeurs nutritionnelles.");
    }
    // Un foodId fourni mais introuvable (fiche supprimée entre-temps, id
    // invalide) tombait auparavant dans le même cas que "libre" sans être
    // détecté ici : caloriesKcal restait `undefined` et Prisma échouait plus
    // bas avec une erreur de validation peu explicite.
    if (item.foodId && !foodById.has(item.foodId) && item.caloriesKcal === undefined) {
      throw new Error("Aliment introuvable : fournis ses valeurs nutritionnelles ou choisis un autre aliment.");
    }
  }

  await prisma.meal.create({
    data: {
      profileId: profile.id,
      date: new Date(data.date),
      type: data.type,
      items: {
        create: data.items.map((item) => {
          const food = item.foodId ? foodById.get(item.foodId) : undefined;
          const ratio = item.quantiteG / 100;
          return {
            foodId: item.foodId,
            nomLibre: item.nomLibre,
            quantiteG: item.quantiteG,
            caloriesKcal: food ? Number(food.caloriesKcal100g) * ratio : item.caloriesKcal!,
            proteinesG: food ? Number(food.proteinesG100g) * ratio : (item.proteinesG ?? 0),
            glucidesG: food ? Number(food.glucidesG100g) * ratio : (item.glucidesG ?? 0),
            lipidesG: food ? Number(food.lipidesG100g) * ratio : (item.lipidesG ?? 0),
            fibresG: food?.fibresG100g ? Number(food.fibresG100g) * ratio : item.fibresG,
          };
        }),
      },
    },
  });

  await recomputerStreakPourJour(profile.id, new Date(data.date));

  revalidatePath("/accueil");
  revalidatePath("/journal");
}

export async function supprimerRepas(mealId: string) {
  const profile = await requireProfile();
  const meal = await prisma.meal.findUnique({ where: { id: mealId } });
  if (!meal || meal.profileId !== profile.id) throw new Error("Repas introuvable");

  await prisma.meal.delete({ where: { id: mealId } });
  await recomputerStreakPourJour(profile.id, meal.date);

  revalidatePath("/accueil");
  revalidatePath("/journal");
}

/** Supprime le repas puis renvoie vers le dashboard (utilisé depuis l'écran de détail). */
export async function supprimerRepasEtRevenir(mealId: string) {
  await supprimerRepas(mealId);
  redirect("/accueil");
}

export async function obtenirRepasDuJour(date: string) {
  const profile = await requireProfile();
  const debutJour = new Date(`${date}T00:00:00.000Z`);
  const finJour = new Date(debutJour);
  finJour.setUTCDate(finJour.getUTCDate() + 1);

  const meals = await prisma.meal.findMany({
    where: { profileId: profile.id, date: { gte: debutJour, lt: finJour } },
    include: { items: { include: { food: true } } },
    orderBy: { createdAt: "asc" },
  });

  const totaux = meals.reduce(
    (acc, meal) => {
      for (const item of meal.items) {
        acc.caloriesKcal += Number(item.caloriesKcal);
        acc.proteinesG += Number(item.proteinesG);
        acc.glucidesG += Number(item.glucidesG);
        acc.lipidesG += Number(item.lipidesG);
        acc.fibresG += Number(item.fibresG ?? 0);
      }
      return acc;
    },
    { caloriesKcal: 0, proteinesG: 0, glucidesG: 0, lipidesG: 0, fibresG: 0 },
  );

  return { meals, totaux };
}

/**
 * Calories consommées par jour sur la semaine calendaire (lundi → dimanche)
 * contenant aujourd'hui, pour le sélecteur de jours du dashboard.
 */
export async function obtenirSemaineDashboard() {
  const profile = await requireProfile();
  const objectifCalories = profile.goals[0]?.objectifCaloriesKcal ?? null;

  const aujourdHui = aujourdHuiLocalCommeDate();
  const decalageLundi = (aujourdHui.getUTCDay() + 6) % 7;
  const lundi = new Date(Date.UTC(aujourdHui.getUTCFullYear(), aujourdHui.getUTCMonth(), aujourdHui.getUTCDate() - decalageLundi));
  const dimancheSuivant = new Date(lundi);
  dimancheSuivant.setUTCDate(dimancheSuivant.getUTCDate() + 7);

  const meals = await prisma.meal.findMany({
    where: { profileId: profile.id, date: { gte: lundi, lt: dimancheSuivant } },
    include: { items: true },
  });

  const parJour = new Map<string, number>();
  for (const meal of meals) {
    const cle = meal.date.toISOString().slice(0, 10);
    const total = meal.items.reduce((s, i) => s + Number(i.caloriesKcal), 0);
    parJour.set(cle, (parJour.get(cle) ?? 0) + total);
  }

  const cleAujourdHui = aujourdHui.toISOString().slice(0, 10);

  return Array.from({ length: 7 }, (_, i) => {
    const jour = new Date(lundi);
    jour.setUTCDate(jour.getUTCDate() + i);
    const cle = jour.toISOString().slice(0, 10);
    const caloriesConsommees = parJour.get(cle) ?? 0;
    return {
      date: cle,
      caloriesConsommees,
      objectifCalories,
      estAujourdHui: cle === cleAujourdHui,
      estFutur: jour.getTime() > new Date(`${cleAujourdHui}T00:00:00.000Z`).getTime(),
    };
  });
}

/** Détail d'un repas + vérification de propriété. */
export async function obtenirRepasParId(mealId: string) {
  const profile = await requireProfile();
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: { items: { include: { food: true } } },
  });
  if (!meal || meal.profileId !== profile.id) return null;
  return meal;
}

/**
 * Ajuste la portion totale d'un repas (en grammes) et redistribue
 * proportionnellement la quantité et les valeurs nutritionnelles de chaque
 * aliment du repas — le ratio valeur/grammage de chaque aliment reste
 * constant, donc l'opération est stable même appliquée plusieurs fois.
 */
export async function ajusterQuantiteRepas(mealId: string, deltaG: number) {
  const profile = await requireProfile();
  const meal = await prisma.meal.findUnique({ where: { id: mealId }, include: { items: true } });
  if (!meal || meal.profileId !== profile.id) throw new Error("Repas introuvable");

  if (!Number.isFinite(deltaG)) {
    throw new Error("Ajustement de quantité invalide.");
  }

  const totalActuel = meal.items.reduce((s, i) => s + Number(i.quantiteG), 0);
  // Bornée à 20 kg pour rester dans une plage plausible pour un repas et
  // éviter qu'une valeur aberrante (bug client, saisie erronée) ne pousse
  // les champs `Decimal` des `MealItem` au-delà de ce que la colonne peut
  // stocker (ce qui ferait échouer toute la transaction avec une erreur peu
  // explicite).
  const totalVoulu = Math.min(20_000, Math.max(10, totalActuel + deltaG));
  const ratio = totalActuel > 0 ? totalVoulu / totalActuel : 1;

  await prisma.$transaction(
    meal.items.map((item) =>
      prisma.mealItem.update({
        where: { id: item.id },
        data: {
          quantiteG: Number(item.quantiteG) * ratio,
          caloriesKcal: Number(item.caloriesKcal) * ratio,
          proteinesG: Number(item.proteinesG) * ratio,
          glucidesG: Number(item.glucidesG) * ratio,
          lipidesG: Number(item.lipidesG) * ratio,
          fibresG: item.fibresG ? Number(item.fibresG) * ratio : undefined,
        },
      }),
    ),
  );

  await recomputerStreakPourJour(profile.id, meal.date);

  revalidatePath("/accueil");
  revalidatePath(`/repas/${mealId}`);
}

/**
 * Moyenne calorique quotidienne sur les `jours` derniers jours, comparée à la
 * période équivalente précédente (pour la flèche de tendance de l'écran Progrès).
 */
export async function obtenirTendanceCalories(jours = 7) {
  const profile = await requireProfile();
  const aujourdHui = aujourdHuiLocalCommeDate();
  const debutActuelle = new Date(aujourdHui);
  debutActuelle.setUTCDate(debutActuelle.getUTCDate() - jours + 1);
  const debutPrecedente = new Date(debutActuelle);
  debutPrecedente.setUTCDate(debutPrecedente.getUTCDate() - jours);

  const meals = await prisma.meal.findMany({
    where: { profileId: profile.id, date: { gte: debutPrecedente } },
    include: { items: true },
  });

  let totalActuelle = 0;
  let totalPrecedente = 0;
  for (const meal of meals) {
    const total = meal.items.reduce((s, i) => s + Number(i.caloriesKcal), 0);
    if (meal.date >= debutActuelle) totalActuelle += total;
    else totalPrecedente += total;
  }

  const moyenneActuelle = Math.round(totalActuelle / jours);
  const moyennePrecedente = totalPrecedente / jours;
  const variationPct = moyennePrecedente > 0 ? Math.round(((moyenneActuelle - moyennePrecedente) / moyennePrecedente) * 100) : null;

  return { moyenneActuelle, variationPct };
}
