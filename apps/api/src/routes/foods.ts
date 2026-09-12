import { createFoodSchema } from "@assiettly/shared";
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { recupererProduitParCodeBarre } from "../services/openFoodFacts";

export async function foodsRoutes(app: FastifyInstance): Promise<void> {
  // Recherche d'aliments avec autocomplétion (insensible à la casse/accents gérée côté DB via ILIKE).
  app.get<{ Querystring: { q?: string } }>("/foods/search", async (request, reply) => {
    const q = request.query.q?.trim();
    if (!q || q.length < 2) return reply.code(400).send({ error: "Requête trop courte" });

    return prisma.food.findMany({
      where: { nom: { contains: q, mode: "insensitive" } },
      orderBy: { nom: "asc" },
      take: 20,
    });
  });

  app.get<{ Params: { code: string } }>("/foods/barcode/:code", async (request, reply) => {
    const { code } = request.params;

    const existant = await prisma.food.findUnique({ where: { codeBarre: code } });
    if (existant) return existant;

    const produit = await recupererProduitParCodeBarre(code);
    if (!produit) return reply.code(404).send({ error: "Produit introuvable sur Open Food Facts" });

    const food = await prisma.food.create({
      data: {
        nom: produit.nom,
        marque: produit.marque,
        source: "OPEN_FOOD_FACTS",
        codeBarre: code,
        caloriesKcal100g: produit.caloriesKcal100g,
        proteinesG100g: produit.proteinesG100g,
        glucidesG100g: produit.glucidesG100g,
        lipidesG100g: produit.lipidesG100g,
        fibresG100g: produit.fibresG100g ?? undefined,
      },
    });
    return food;
  });

  app.post("/foods", async (request, reply) => {
    const parsed = createFoodSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const { profileId } = request.auth;
    const food = await prisma.food.create({
      data: { ...parsed.data, source: "MANUEL", createdByProfileId: profileId },
    });
    return reply.code(201).send(food);
  });
}
