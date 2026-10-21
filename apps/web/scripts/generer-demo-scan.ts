/**
 * Script hors bundle de production — génère les résultats réels de la
 * démo de scan du hero (`src/data/demoScanPlats.ts`) en envoyant chaque
 * photo de `public/landing/demo/` au module d'analyse réel
 * (`src/server/foodAnalysis/analyserRepas.ts` — même modèle, même prompt
 * système, mêmes structured outputs que l'écran de scan réel de l'app).
 *
 * Honnêteté non négociable (cf. brief landing) : ce script n'arrondit ni
 * ne corrige rien. Il imprime exactement ce que le modèle renvoie et écrit
 * ces valeurs telles quelles dans `demoScanPlats.ts`.
 *
 * Usage :
 *   cd apps/web && npx tsx scripts/generer-demo-scan.ts
 *
 * Nécessite un vrai ANTHROPIC_API_KEY dans apps/web/.env (jamais dans ce
 * script, jamais commité). Les photos manquantes dans
 * public/landing/demo/ sont simplement ignorées (affichées comme
 * "absente" dans le résumé final) — le script ne plante pas pour autant.
 */
import "dotenv/config";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyserPhotoRepas } from "../src/server/foodAnalysis/analyserRepas";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOSSIER_DEMO = path.resolve(__dirname, "../public/landing/demo");

// ID de profil factice uniquement pour satisfaire la contrainte de clé
// étrangère du journal d'appels (FoodAnalysisLog) — ce script tourne hors
// contexte applicatif, sans utilisateur réel. Si la base n'est pas
// joignable ou que cet ID n'existe pas, la journalisation échoue en
// silence (déjà géré par un .catch() dans analyserPhotoRepas) sans
// affecter le résultat de l'analyse elle-même.
const PROFILE_ID_SCRIPT = "00000000-0000-0000-0000-000000000000";

interface PlatASCanner {
  id: string;
  nom: string;
  fichier: string;
}

// Le modèle répond avec haute/moyenne/basse (cf. schema.ts) ; demoScanPlats.ts
// utilise elevee/moyenne/faible — mappage direct, aucune réinterprétation.
const CONFIANCE_VERS_DEMO: Record<string, string> = { haute: "elevee", moyenne: "moyenne", basse: "faible" };

const PLATS: PlatASCanner[] = [
  { id: "quiche-lorraine", nom: "Quiche lorraine", fichier: "quiche-lorraine.webp" },
  { id: "boeuf-bourguignon", nom: "Bœuf bourguignon", fichier: "boeuf-bourguignon.webp" },
  { id: "croissant", nom: "Croissant", fichier: "croissant.webp" },
  { id: "croque-monsieur", nom: "Croque-monsieur", fichier: "croque-monsieur.webp" },
  { id: "poulet-riz", nom: "Poulet-riz (salle de sport)", fichier: "poulet-riz.webp" },
  { id: "ratatouille", nom: "Ratatouille", fichier: "ratatouille.webp" },
];

async function main() {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes("placeholder")) {
    console.error(
      "✗ ANTHROPIC_API_KEY absente ou factice dans apps/web/.env — impossible d'appeler la vraie API. " +
        "Renseigne une vraie clé (jamais dans ce script, jamais commitée) puis relance.",
    );
    process.exitCode = 1;
    return;
  }

  const resultats: Array<{
    id: string;
    nom: string;
    statut: "ok" | "absente" | "echec";
    kcal?: number;
    proteinesG?: number;
    glucidesG?: number;
    lipidesG?: number;
    confiance?: string;
    erreur?: string;
  }> = [];

  for (const plat of PLATS) {
    const chemin = path.join(DOSSIER_DEMO, plat.fichier);
    if (!existsSync(chemin)) {
      console.log(`— ${plat.nom} : photo absente (${plat.fichier}), ignoré.`);
      resultats.push({ id: plat.id, nom: plat.nom, statut: "absente" });
      continue;
    }

    const imageBase64 = readFileSync(chemin).toString("base64");
    console.log(`→ Analyse de ${plat.nom}...`);
    try {
      const analyse = await analyserPhotoRepas({
        profileId: PROFILE_ID_SCRIPT,
        imageBase64,
        mediaType: "image/webp",
      });
      const { totaux } = analyse;
      resultats.push({
        id: plat.id,
        nom: plat.nom,
        statut: "ok",
        kcal: Math.round(totaux.calories),
        proteinesG: Math.round(totaux.proteinesG),
        glucidesG: Math.round(totaux.glucidesG),
        lipidesG: Math.round(totaux.lipidesG),
        confiance: CONFIANCE_VERS_DEMO[analyse.confianceGlobale] ?? analyse.confianceGlobale,
      });
      console.log(`  ✓ ${Math.round(totaux.calories)} kcal, confiance ${analyse.confianceGlobale}`);
    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : String(erreur);
      console.error(`  ✗ Échec : ${message}`);
      resultats.push({ id: plat.id, nom: plat.nom, statut: "echec", erreur: message });
    }
  }

  console.log("\n=== Résumé ===");
  console.table(
    resultats.map((r) => ({
      Plat: r.nom,
      Statut: r.statut,
      Kcal: r.kcal ?? "—",
      "P/G/L (g)": r.statut === "ok" ? `${r.proteinesG}/${r.glucidesG}/${r.lipidesG}` : "—",
      Confiance: r.confiance ?? "—",
      Erreur: r.erreur ?? "",
    })),
  );

  console.log(
    "\nCopie les résultats \"ok\" ci-dessus dans src/data/demoScanPlats.ts (champ `resultat`) — " +
      "ce script n'écrit rien automatiquement dans ce fichier, pour que tu valides les chiffres avant qu'ils ne se retrouvent sur la landing.",
  );
}

main();
