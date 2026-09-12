import { createMealSchema } from "@assiettly/shared";
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { recomputerStreakPourJour } from "../services/streakService";

function ratio(quantiteG: number) {
  return quantiteG / 100;
}

export async function mealsRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: { date?: string } }>("/meals", async (request, reply) => {
    const { date } = request.query;
    if (!date) return reply.code(400).send({ error: "Paramètre `date` requis (YYYY-MM-DD)" });

    const { profileId } = request.auth;
    const debutJour = new Date(`${date}T00:00:00.000Z`);
    const finJour = new Date(debutJour);
    finJour.setUTCDate(finJour.getUTCDate() + 1);

    const meals = await prisma.meal.findMany({
      where: { profileId, date: { gte: debutJour, lt: finJour } },
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
  });

  app.post("/meals", async (request, reply) => {
    const parsed = createMealSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const { profileId } = request.auth;
    const { date, type, items } = parsed.data;

    const foodIds = items.map((i) => i.foodId).filter((id): id is string => !!id);
    const foods = foodIds.length
      ? await prisma.food.findMany({ where: { id: { in: foodIds } } })
      : [];
    const foodById = new Map(foods.map((f) => [f.id, f]));

    for (const item of items) {
      if (!item.foodId && item.caloriesKcal === undefined) {
        return reply
          .code(400)
          .send({ error: "Chaque aliment libre (sans foodId) doit fournir ses valeurs nutritionnelles." });
      }
      if (item.foodId && !foodById.has(item.foodId)) {
        return reply.code(400).send({ error: `Aliment introuvable : ${item.foodId}` });
      }
    }

    const meal = await prisma.meal.create({
      data: {
        profileId,
        date: new Date(date),
        type,
        items: {
          create: items.map((item) => {
            const food = item.foodId ? foodById.get(item.foodId) : undefined;
            const r = ratio(item.quantiteG);
            return {
              foodId: item.foodId,
              nomLibre: item.nomLibre,
              quantiteG: item.quantiteG,
              caloriesKcal: food ? Number(food.caloriesKcal100g) * r : item.caloriesKcal!,
              proteinesG: food ? Number(food.proteinesG100g) * r : (item.proteinesG ?? 0),
              glucidesG: food ? Number(food.glucidesG100g) * r : (item.glucidesG ?? 0),
              lipidesG: food ? Number(food.lipidesG100g) * r : (item.lipidesG ?? 0),
              fibresG: food?.fibresG100g ? Number(food.fibresG100g) * r : item.fibresG,
            };
          }),
        },
      },
      include: { items: true },
    });

    await recomputerStreakPourJour(profileId, new Date(date));

    return reply.code(201).send(meal);
  });

  app.delete<{ Params: { id: string } }>("/meals/:id", async (request, reply) => {
    const { profileId } = request.auth;
    const meal = await prisma.meal.findUnique({ where: { id: request.params.id } });
    if (!meal || meal.profileId !== profileId) {
      return reply.code(404).send({ error: "Repas introuvable" });
    }

    await prisma.meal.delete({ where: { id: meal.id } });
    await recomputerStreakPourJour(profileId, meal.date);

    return reply.code(204).send();
  });
}
