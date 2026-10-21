/**
 * Données de la démo de scan du hero (l'ardoise) — de vraies photos de plats
 * français, et le vrai résultat mesuré par Assiettly sur CHACUNE de ces
 * photos précises (pas une moyenne, pas une estimation a priori).
 *
 * Honnêteté non négociable (cf. brief landing) : `resultat` reste `null`
 * tant que le vrai test n'a pas été fait sur la vraie photo — le composant
 * affiche alors "résultat à venir", jamais un chiffre inventé. Les valeurs
 * ci-dessous sont copiées telles quelles depuis la sortie de
 * `scripts/generer-demo-scan.ts` (mode `DEMO_SCAN_JSON=1`, qui imprime la
 * réponse complète du modèle y compris le détail par ingrédient) : aucun
 * arrondi ni correction manuelle, l'arrondi d'affichage se fait uniquement
 * au rendu (même convention que l'écran de scan réel, cf. EcranScan.tsx).
 *
 * Le modèle n'est pas déterministe (pas de température fixée à 0) : deux
 * runs sur la même photo donnent des totaux légèrement différents. Ce
 * fichier fige le résultat d'un run donné, daté ci-dessous — c'est normal
 * et attendu, pas une incohérence.
 *
 * Dernière génération : 2026-10-21, modèle claude-sonnet-4-5-20250929.
 *
 * Pour régénérer :
 *   cd apps/web && DEMO_SCAN_JSON=1 npx tsx scripts/generer-demo-scan.ts
 * (nécessite un vrai ANTHROPIC_API_KEY dans apps/web/.env, jamais commité)
 */
export interface IngredientDemo {
  nom: string;
  quantiteEstimee: string;
  quantiteEstimeeG: number;
  calories: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
  confiance: "elevee" | "moyenne" | "faible";
}

export interface ResultatDemoScan {
  caloriesKcal: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
  confiance: "elevee" | "moyenne" | "faible";
  ingredients: IngredientDemo[];
}

export interface PlatDemo {
  id: string;
  nom: string;
  image: string;
  resultat: ResultatDemoScan | null;
}

export const PLATS_DEMO: PlatDemo[] = [
  {
    id: "quiche-lorraine",
    nom: "Quiche lorraine",
    image: "/landing/demo/quiche-lorraine.webp",
    resultat: {
      caloriesKcal: 490,
      proteinesG: 18,
      glucidesG: 22.6,
      lipidesG: 36.3,
      confiance: "moyenne",
      ingredients: [
        { nom: "Pâte brisée", quantiteEstimee: "1 part (environ 50 g)", quantiteEstimeeG: 50, calories: 180, proteinesG: 2.5, glucidesG: 20, lipidesG: 10, confiance: "elevee" },
        { nom: "Appareil à quiche (œufs et crème)", quantiteEstimee: "environ 80 g", quantiteEstimeeG: 80, calories: 160, proteinesG: 6, glucidesG: 2, lipidesG: 14, confiance: "moyenne" },
        { nom: "Lardons", quantiteEstimee: "environ 25 g", quantiteEstimeeG: 25, calories: 90, proteinesG: 5, glucidesG: 0.5, lipidesG: 7.5, confiance: "moyenne" },
        { nom: "Fromage (emmental ou gruyère)", quantiteEstimee: "environ 15 g", quantiteEstimeeG: 15, calories: 60, proteinesG: 4.5, glucidesG: 0.1, lipidesG: 4.8, confiance: "moyenne" },
      ],
    },
  },
  {
    id: "boeuf-bourguignon",
    nom: "Bœuf bourguignon",
    image: "/landing/demo/boeuf-bourguignon.webp",
    resultat: {
      caloriesKcal: 621,
      proteinesG: 38.7,
      glucidesG: 10.9,
      lipidesG: 44.4,
      confiance: "moyenne",
      ingredients: [
        { nom: "Bœuf (viande en morceaux)", quantiteEstimee: "environ 150 g", quantiteEstimeeG: 150, calories: 312, proteinesG: 30, glucidesG: 0, lipidesG: 21, confiance: "moyenne" },
        { nom: "Lardons", quantiteEstimee: "environ 30 g", quantiteEstimeeG: 30, calories: 120, proteinesG: 4.5, glucidesG: 0.3, lipidesG: 11, confiance: "moyenne" },
        { nom: "Champignons de Paris", quantiteEstimee: "environ 80 g", quantiteEstimeeG: 80, calories: 18, proteinesG: 2.4, glucidesG: 0.4, lipidesG: 0.4, confiance: "elevee" },
        { nom: "Oignons grelots", quantiteEstimee: "environ 60 g (6-7 petits oignons)", quantiteEstimeeG: 60, calories: 24, proteinesG: 0.6, glucidesG: 5.4, lipidesG: 0.1, confiance: "elevee" },
        { nom: "Sauce au vin rouge", quantiteEstimee: "environ 120 ml", quantiteEstimeeG: 120, calories: 72, proteinesG: 1.2, glucidesG: 4.8, lipidesG: 3.6, confiance: "moyenne" },
        { nom: "Matière grasse (beurre/huile pour la cuisson)", quantiteEstimee: "environ 10 g", quantiteEstimeeG: 10, calories: 75, proteinesG: 0, glucidesG: 0, lipidesG: 8.3, confiance: "faible" },
      ],
    },
  },
  {
    id: "croissant",
    nom: "Croissant",
    image: "/landing/demo/croissant.webp",
    resultat: {
      caloriesKcal: 240,
      proteinesG: 4.8,
      glucidesG: 26.4,
      lipidesG: 12.6,
      confiance: "elevee",
      ingredients: [
        { nom: "Croissant au beurre", quantiteEstimee: "1 pièce (environ 60g)", quantiteEstimeeG: 60, calories: 240, proteinesG: 4.8, glucidesG: 26.4, lipidesG: 12.6, confiance: "elevee" },
      ],
    },
  },
  {
    id: "croque-monsieur",
    nom: "Croque-monsieur",
    image: "/landing/demo/croque-monsieur.webp",
    resultat: {
      caloriesKcal: 473,
      proteinesG: 26.4,
      glucidesG: 29.2,
      lipidesG: 27.8,
      confiance: "moyenne",
      ingredients: [
        { nom: "Pain de mie", quantiteEstimee: "2 tranches", quantiteEstimeeG: 60, calories: 158, proteinesG: 5.4, glucidesG: 28.2, lipidesG: 2.4, confiance: "elevee" },
        { nom: "Jambon blanc", quantiteEstimee: "1 tranche", quantiteEstimeeG: 40, calories: 46, proteinesG: 8.4, glucidesG: 0.4, lipidesG: 1.2, confiance: "moyenne" },
        { nom: "Fromage à raclette ou emmental râpé", quantiteEstimee: "environ 50 g", quantiteEstimeeG: 50, calories: 195, proteinesG: 12.5, glucidesG: 0.5, lipidesG: 16, confiance: "moyenne" },
        { nom: "Beurre", quantiteEstimee: "environ 10 g", quantiteEstimeeG: 10, calories: 74, proteinesG: 0.1, glucidesG: 0.1, lipidesG: 8.2, confiance: "moyenne" },
      ],
    },
  },
  {
    id: "poulet-riz",
    nom: "Poulet-riz (salle de sport)",
    image: "/landing/demo/poulet-riz.webp",
    resultat: {
      caloriesKcal: 588,
      proteinesG: 43.8,
      glucidesG: 58.2,
      lipidesG: 18.5,
      confiance: "elevee",
      ingredients: [
        { nom: "Blanc de poulet grillé", quantiteEstimee: "1 filet tranché (environ 150 g)", quantiteEstimeeG: 150, calories: 247, proteinesG: 37.5, glucidesG: 0, lipidesG: 10.5, confiance: "elevee" },
        { nom: "Riz blanc cuit", quantiteEstimee: "environ 200 g", quantiteEstimeeG: 200, calories: 260, proteinesG: 5.4, glucidesG: 56, lipidesG: 0.4, confiance: "elevee" },
        { nom: "Sauce crémeuse aux herbes", quantiteEstimee: "environ 40 g", quantiteEstimeeG: 40, calories: 80, proteinesG: 0.8, glucidesG: 2, lipidesG: 7.6, confiance: "moyenne" },
        { nom: "Herbes fraîches (thym/romarin)", quantiteEstimee: "quelques brins (2 g)", quantiteEstimeeG: 2, calories: 1, proteinesG: 0.1, glucidesG: 0.2, lipidesG: 0, confiance: "elevee" },
      ],
    },
  },
  {
    id: "ratatouille",
    nom: "Ratatouille",
    image: "/landing/demo/ratatouille.webp",
    resultat: {
      caloriesKcal: 247,
      proteinesG: 4.6,
      glucidesG: 20.1,
      lipidesG: 16.3,
      confiance: "moyenne",
      ingredients: [
        { nom: "Aubergine", quantiteEstimee: "environ 80 g", quantiteEstimeeG: 80, calories: 20, proteinesG: 0.8, glucidesG: 3.2, lipidesG: 0.2, confiance: "moyenne" },
        { nom: "Courgette", quantiteEstimee: "environ 70 g", quantiteEstimeeG: 70, calories: 12, proteinesG: 0.8, glucidesG: 1.5, lipidesG: 0.2, confiance: "moyenne" },
        { nom: "Poivron rouge", quantiteEstimee: "environ 60 g", quantiteEstimeeG: 60, calories: 15, proteinesG: 0.5, glucidesG: 2.8, lipidesG: 0.2, confiance: "elevee" },
        { nom: "Poivron jaune", quantiteEstimee: "environ 50 g", quantiteEstimeeG: 50, calories: 13, proteinesG: 0.5, glucidesG: 2.4, lipidesG: 0.2, confiance: "elevee" },
        { nom: "Poivron vert", quantiteEstimee: "environ 40 g", quantiteEstimeeG: 40, calories: 8, proteinesG: 0.3, glucidesG: 1.6, lipidesG: 0.1, confiance: "elevee" },
        { nom: "Oignon", quantiteEstimee: "environ 40 g", quantiteEstimeeG: 40, calories: 16, proteinesG: 0.4, glucidesG: 3.6, lipidesG: 0.1, confiance: "moyenne" },
        { nom: "Tomate (sauce et morceaux)", quantiteEstimee: "environ 120 g", quantiteEstimeeG: 120, calories: 22, proteinesG: 1.1, glucidesG: 3.8, lipidesG: 0.2, confiance: "moyenne" },
        { nom: "Huile d'olive", quantiteEstimee: "environ 15 ml", quantiteEstimeeG: 15, calories: 135, proteinesG: 0, glucidesG: 0, lipidesG: 15, confiance: "moyenne" },
        { nom: "Herbes de Provence", quantiteEstimee: "environ 2 g", quantiteEstimeeG: 2, calories: 6, proteinesG: 0.2, glucidesG: 1.2, lipidesG: 0.1, confiance: "elevee" },
      ],
    },
  },
];
