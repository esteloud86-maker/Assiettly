import { calculerObjectifs, updateProfileSchema, type ProfilPhysique } from "@assiettly/shared";
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

export async function profileRoutes(app: FastifyInstance): Promise<void> {
  // Récupère (ou crée à la volée) le profil du user connecté.
  app.get("/me", async (request) => {
    const { profileId, email } = request.auth;
    const profile = await prisma.profile.upsert({
      where: { id: profileId },
      create: { id: profileId, email },
      update: {},
      include: { goals: { where: { actif: true } }, streakSummary: true },
    });
    return profile;
  });

  app.put("/me", async (request, reply) => {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const { profileId, email } = request.auth;
    const data = parsed.data;

    const profile = await prisma.profile.upsert({
      where: { id: profileId },
      create: {
        id: profileId,
        email,
        ...data,
        dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
      },
      update: {
        ...data,
        dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : undefined,
      },
    });
    return profile;
  });

  // Calcule les objectifs à partir du profil physique et les active
  // (désactive l'objectif précédent, en crée un nouveau).
  app.post("/me/goals/calculate", async (request, reply) => {
    const { profileId } = request.auth;
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) return reply.code(404).send({ error: "Profil introuvable" });

    const derniereMesure = await prisma.weightLog.findFirst({
      where: { profileId },
      orderBy: { date: "desc" },
    });

    if (
      !profile.sexe ||
      !profile.dateNaissance ||
      !profile.tailleCm ||
      !profile.niveauActivite ||
      !profile.objectifType ||
      !derniereMesure
    ) {
      return reply.code(400).send({
        error:
          "Profil incomplet : sexe, date de naissance, taille, niveau d'activité, objectif et un poids sont requis.",
      });
    }

    const profilPhysique: ProfilPhysique = {
      sexe: profile.sexe,
      dateNaissance: profile.dateNaissance.toISOString().slice(0, 10),
      tailleCm: profile.tailleCm,
      poidsKg: Number(derniereMesure.poidsKg),
      niveauActivite: profile.niveauActivite,
      objectifType: profile.objectifType,
    };

    const objectifs = calculerObjectifs(profilPhysique);

    const goal = await prisma.$transaction(async (tx) => {
      await tx.goal.updateMany({ where: { profileId, actif: true }, data: { actif: false } });
      return tx.goal.create({
        data: {
          profileId,
          objectifCaloriesKcal: objectifs.caloriesKcal,
          objectifProteinesG: objectifs.proteinesG,
          objectifGlucidesG: objectifs.glucidesG,
          objectifLipidesG: objectifs.lipidesG,
        },
      });
    });

    return goal;
  });

  app.get("/me/goals", async (request) => {
    const { profileId } = request.auth;
    return prisma.goal.findFirst({ where: { profileId, actif: true }, orderBy: { actifDepuis: "desc" } });
  });
}
