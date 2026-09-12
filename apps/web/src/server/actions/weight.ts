"use server";

import { createWeightLogSchema } from "@assiettly/shared";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/server/auth";

export async function enregistrerPoids(input: { poidsKg: number; date: string }) {
  const data = createWeightLogSchema.parse(input);
  const profile = await requireProfile();

  await prisma.weightLog.upsert({
    where: { profileId_date: { profileId: profile.id, date: new Date(data.date) } },
    create: { profileId: profile.id, poidsKg: data.poidsKg, date: new Date(data.date) },
    update: { poidsKg: data.poidsKg },
  });

  revalidatePath("/poids");
  revalidatePath("/accueil");
}

export async function obtenirHistoriquePoids() {
  const profile = await requireProfile();
  return prisma.weightLog.findMany({ where: { profileId: profile.id }, orderBy: { date: "asc" } });
}
