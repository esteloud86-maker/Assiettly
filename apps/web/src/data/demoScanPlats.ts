/**
 * Données de la démo de scan du hero — de vraies photos de plats français,
 * et le vrai résultat mesuré par Assiettly sur CHACUNE de ces photos
 * précises (pas une moyenne, pas une estimation a priori).
 *
 * Honnêteté non négociable (cf. brief landing) : `resultat` reste `null`
 * tant que le vrai test n'a pas été fait sur la vraie photo. Le composant
 * `DemoScan` affiche un état "résultat à venir" pour tout élément à `null`
 * — il n'invente jamais de chiffre. Ne jamais remplir `resultat` avec une
 * valeur estimée "à la louche" : seulement le résultat réel renvoyé par
 * `analyserPhotoRepas` sur cette photo.
 *
 * Pour brancher une vraie photo :
 * 1. Dépose le fichier (format WebP, ≤800px de large, ≤150 Ko) dans
 *    apps/web/public/landing/demo/<id>.webp
 * 2. Lance `npx tsx scripts/generer-demo-scan.ts` (depuis apps/web) — ce
 *    script envoie la photo au module d'analyse réel et imprime le résultat
 * 3. Recopie le résultat obtenu dans le champ `resultat` ci-dessous
 */
export interface ResultatDemoScan {
  caloriesKcal: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
  confiance: "elevee" | "moyenne" | "faible";
}

export interface PlatDemo {
  id: string;
  nom: string;
  /** Repli visuel tant que la vraie photo n'est pas déposée dans /public/landing/demo/. */
  emoji: string;
  image: string;
  resultat: ResultatDemoScan | null;
}

export const PLATS_DEMO: PlatDemo[] = [
  { id: "quiche-lorraine", nom: "Quiche lorraine", emoji: "🥧", image: "/landing/demo/quiche-lorraine.webp", resultat: null },
  { id: "boeuf-bourguignon", nom: "Bœuf bourguignon", emoji: "🍲", image: "/landing/demo/boeuf-bourguignon.webp", resultat: null },
  { id: "croissant", nom: "Croissant", emoji: "🥐", image: "/landing/demo/croissant.webp", resultat: null },
  { id: "croque-monsieur", nom: "Croque-monsieur", emoji: "🥪", image: "/landing/demo/croque-monsieur.webp", resultat: null },
  { id: "poulet-riz", nom: "Poulet-riz (salle de sport)", emoji: "🍗", image: "/landing/demo/poulet-riz.webp", resultat: null },
  { id: "ratatouille", nom: "Ratatouille", emoji: "🍆", image: "/landing/demo/ratatouille.webp", resultat: null },
];
