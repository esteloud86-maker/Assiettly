import { AVIS, type Avis } from "@/data/avis";
import { AVIS_DEV } from "@/data/avis.dev";

/** En dessous de ce nombre d'avis valides, la section livre d'or ne s'affiche pas du tout. */
const SEUIL_AFFICHAGE = 3;

function avisDeTest(): Avis[] {
  // Next.js remplace `process.env.NODE_ENV` par une chaîne littérale au
  // build ("production" en prod) : cette branche devient `if (false)`,
  // que le bundler élimine avec son seul appelant (AVIS_DEV) — vérifié par
  // un build réel + grep du bundle de sortie, cf. PROGRESS.md. Ne JAMAIS
  // importer `avis.dev` ailleurs que dans ce fichier.
  if (process.env.NODE_ENV === "production") return [];
  return AVIS_DEV;
}

/**
 * Avis à afficher sur la landing : réels + (hors prod) de test, filtrés sur
 * le consentement, triés du plus récent au plus ancien. Tableau vide si on
 * est sous le seuil — c'est ce que `LivreOr.tsx` et la navigation utilisent
 * pour décider s'ils se rendent ou non.
 */
export function obtenirAvisAffiches(): Avis[] {
  const tous = [...AVIS, ...avisDeTest()]
    .filter((a) => a.consentement === true)
    .sort((a, b) => b.date.localeCompare(a.date));

  return tous.length >= SEUIL_AFFICHAGE ? tous : [];
}
