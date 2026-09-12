import { FREEZES_MAX_PAR_MOIS, freezeStreakSchema, palierAtteint, prochainPalier } from "@assiettly/shared";
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { geler } from "../services/streakService";

export async function streaksRoutes(app: FastifyInstance): Promise<void> {
  app.get("/streaks/summary", async (request) => {
    const { profileId } = request.auth;
    const summary = await prisma.streakSummary.findUnique({ where: { profileId } });
    const streakActuel = summary?.streakActuel ?? 0;

    const now = new Date();
    const memeMois =
      summary?.moisReferenceFreeze &&
      summary.moisReferenceFreeze.getUTCFullYear() === now.getUTCFullYear() &&
      summary.moisReferenceFreeze.getUTCMonth() === now.getUTCMonth();

    return {
      streakActuel,
      streakMax: summary?.streakMax ?? 0,
      dernierJourFlamme: summary?.dernierJourFlamme ?? null,
      freezesRestantsCeMois: FREEZES_MAX_PAR_MOIS - (memeMois ? (summary?.freezesUtilisesMois ?? 0) : 0),
      palierAtteint: palierAtteint(streakActuel),
      prochainPalier: prochainPalier(streakActuel),
    };
  });

  // Calendrier façon "Strava" : jours en flamme / gelés / manqués sur une période.
  app.get<{ Querystring: { debut?: string; fin?: string } }>("/streaks/calendar", async (request, reply) => {
    const { debut, fin } = request.query;
    if (!debut || !fin) return reply.code(400).send({ error: "Paramètres `debut` et `fin` requis (YYYY-MM-DD)" });

    const { profileId } = request.auth;
    const jours = await prisma.streakDay.findMany({
      where: { profileId, date: { gte: new Date(debut), lte: new Date(fin) } },
      orderBy: { date: "asc" },
    });
    return jours;
  });

  app.post("/streaks/freeze", async (request, reply) => {
    const parsed = freezeStreakSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const { profileId } = request.auth;
    const resultat = await geler(profileId, new Date(parsed.data.date));
    if (!resultat.ok) return reply.code(400).send({ error: resultat.raison });

    return { ok: true };
  });
}
