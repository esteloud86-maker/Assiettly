import { createWeightLogSchema } from "@assiettly/shared";
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function weightRoutes(app: FastifyInstance): Promise<void> {
  app.get("/weight", async (request) => {
    const { profileId } = request.auth;
    return prisma.weightLog.findMany({ where: { profileId }, orderBy: { date: "asc" } });
  });

  app.post("/weight", async (request, reply) => {
    const parsed = createWeightLogSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const { profileId } = request.auth;
    const { poidsKg, date } = parsed.data;

    const log = await prisma.weightLog.upsert({
      where: { profileId_date: { profileId, date: new Date(date) } },
      create: { profileId, poidsKg, date: new Date(date) },
      update: { poidsKg },
    });
    return log;
  });
}
