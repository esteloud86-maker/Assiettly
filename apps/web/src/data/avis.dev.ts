/**
 * Avis de test, à remplacer — PAS de vrais avis, uniquement pour visualiser
 * le rendu de la section "Livre d'or" en développement avant d'avoir de
 * vrais retours utilisateurs. Jamais chargées en production (cf. garde dans
 * `src/lib/avis.ts`, basée sur `process.env.NODE_ENV`) — vérifié par un
 * build réel, cf. PROGRESS.md.
 *
 * Volontairement ennuyeux et non uniformément élogieux (notes absentes,
 * moyennes, texte neutre) : le but est de tester que l'affichage gère bien
 * un avis sans note, un texte court, un texte long — pas de produire
 * quelque chose qui ressemble à un vrai témoignage marketing.
 */
import type { Avis } from "./avis";

export const AVIS_DEV: Avis[] = [
  {
    id: "dev-1",
    prenom: "Testeur A",
    texte: "Avis de test, à remplacer — sans note pour vérifier que l'affichage s'en passe bien.",
    date: "2026-01-01",
    consentement: true,
  },
  {
    id: "dev-2",
    prenom: "Testeur B",
    texte: "Avis de test, à remplacer. Texte un peu plus long pour voir comment ça s'enchaîne sur plusieurs lignes dans la carte.",
    note: 3,
    date: "2026-01-02",
    consentement: true,
  },
  {
    id: "dev-3",
    prenom: "T.",
    texte: "Avis de test, à remplacer — initiale seule au lieu d'un prénom complet.",
    note: 5,
    date: "2026-01-03",
    consentement: true,
  },
];
