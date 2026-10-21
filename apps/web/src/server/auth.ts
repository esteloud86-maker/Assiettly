import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const INCLUDE_PROFILE = {
  goals: { where: { actif: true } },
  streakSummary: true,
  subscription: true,
} as const;

/** Cookie posé côté client sur /inscription?ref=CODE (cf. inscription/page.tsx) — survit à la redirection OAuth Google, même origine. */
export const COOKIE_PARRAINAGE = "assiettly_ref";

function genererCodeParrainage(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Génère un code de parrainage unique (collision quasi impossible sur 6 caractères, retry défensif). */
async function genererCodeParrainageUnique(): Promise<string> {
  for (let tentative = 0; tentative < 5; tentative++) {
    const code = genererCodeParrainage();
    const collision = await prisma.profile.findUnique({ where: { codeParrainage: code } });
    if (!collision) return code;
  }
  throw new Error("Impossible de générer un code de parrainage unique.");
}

/**
 * Lie le nouveau profil à son parrain si un code de parrainage valide est
 * présent (cookie posé sur /inscription?ref=CODE). Best-effort : ça ne doit
 * jamais faire échouer la création de compte si quelque chose ne va pas.
 */
async function lierParrainageSiPresent(nouveauProfileId: string): Promise<void> {
  try {
    const codeParrain = cookies().get(COOKIE_PARRAINAGE)?.value;
    if (!codeParrain) return;

    const parrain = await prisma.profile.findUnique({ where: { codeParrainage: codeParrain } });
    if (!parrain || parrain.id === nouveauProfileId) return;

    await prisma.parrainage.create({ data: { parrainId: parrain.id, filleulId: nouveauProfileId } });
  } catch (erreur) {
    console.error("[parrainage] Échec de l'enregistrement du lien de parrainage", erreur);
  }
}

/** Profil courant (créé à la volée au premier appel), ou `null` si non connecté. */
export async function getCurrentProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const existant = await prisma.profile.findUnique({ where: { id: user.id }, include: INCLUDE_PROFILE });
  if (existant) return existant;

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

  const profile = await prisma.profile.create({
    data: { id: user.id, email: user.email!, nom: prenom, codeParrainage: await genererCodeParrainageUnique() },
    include: INCLUDE_PROFILE,
  });

  await lierParrainageSiPresent(profile.id);

  return profile;
}

/** Comme `getCurrentProfile`, mais redirige vers /connexion si non connecté. */
export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");
  return profile;
}
