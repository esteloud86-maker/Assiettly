"use server";

import { createMealSchema } from "@assiettly/shared";
import { revalidatePath } from "next/cache";
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

  return prisma.food.create({
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
      }
      return acc;
    },
    { caloriesKcal: 0, proteinesG: 0, glucidesG: 0, lipidesG: 0 },
  );

  return { meals, totaux };
}
