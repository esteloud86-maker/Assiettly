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
 * 1. Dépose le fichier dans apps/web/public/landing/demo/<id>.jpg
 * 2. Fais tourner le scan réel sur cette photo (ex: via l'écran /scanner)
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
  { id: "quiche-lorraine", nom: "Quiche lorraine", emoji: "🥧", image: "/landing/demo/quiche-lorraine.jpg", resultat: null },
  { id: "boeuf-bourguignon", nom: "Bœuf bourguignon", emoji: "🍲", image: "/landing/demo/boeuf-bourguignon.jpg", resultat: null },
  { id: "croissant", nom: "Croissant", emoji: "🥐", image: "/landing/demo/croissant.jpg", resultat: null },
  { id: "croque-monsieur", nom: "Croque-monsieur", emoji: "🥪", image: "/landing/demo/croque-monsieur.jpg", resultat: null },
  { id: "poulet-riz", nom: "Poulet-riz (salle de sport)", emoji: "🍗", image: "/landing/demo/poulet-riz.jpg", resultat: null },
  { id: "ratatouille", nom: "Ratatouille", emoji: "🍆", image: "/landing/demo/ratatouille.jpg", resultat: null },
];
