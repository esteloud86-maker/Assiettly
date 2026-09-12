import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/** Profil courant (créé à la volée au premier appel), ou `null` si non connecté. */
export async function getCurrentProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.profile.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email! },
    update: {},
    include: {
      goals: { where: { actif: true } },
      streakSummary: true,
      subscription: true,
    },
  });
}

/** Comme `getCurrentProfile`, mais redirige vers /connexion si non connecté. */
export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");
  return profile;
}
