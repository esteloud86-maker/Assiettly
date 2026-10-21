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

  // Préremplissage à la création uniquement (jamais écrasé ensuite) : pour
  // une première connexion via Google, `user_metadata` porte le prénom
  // transmis par Google (déjà vérifié par eux) — strict minimum en plus de
  // l'email, conformément à la politique de confidentialité. Pas d'avatar
  // stocké : pas de colonne prévue pour ça, et ce n'était pas nécessaire.
  const prenom =
    (user.user_metadata?.given_name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  return prisma.profile.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email!, nom: prenom },
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
