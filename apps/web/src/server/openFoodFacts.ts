interface ProduitOpenFoodFacts {
  nom: string;
  marque: string | null;
  caloriesKcal100g: number;
  proteinesG100g: number;
  glucidesG100g: number;
  lipidesG100g: number;
  fibresG100g: number | null;
}

/**
 * Récupère un produit par code-barres depuis Open Food Facts, avec priorité
 * aux champs en français (`product_name_fr`) pour coller au marché français.
 */
const TIMEOUT_MS = 8_000;

export async function recupererProduitParCodeBarre(
  codeBarre: string,
): Promise<ProduitOpenFoodFacts | null> {
  // Le service externe peut être injoignable, lent, ou renvoyer un JSON
  // inattendu : dans tous ces cas on renvoie null (produit non trouvé)
  // plutôt que de laisser l'erreur remonter et faire planter l'action
  // appelante (recherche par code-barres).
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${codeBarre}.json`, {
      headers: { "User-Agent": "Assiettly/0.1 (contact@assiettly.fr)" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      status: number;
      product?: {
        product_name_fr?: string;
        product_name?: string;
        brands?: string;
        nutriments?: Record<string, number>;
      };
    };

    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const n = p.nutriments ?? {};

    const nom = p.product_name_fr ?? p.product_name;
    if (!nom) return null;

    return {
      nom,
      marque: p.brands ?? null,
      caloriesKcal100g: n["energy-kcal_100g"] ?? 0,
      proteinesG100g: n["proteins_100g"] ?? 0,
      glucidesG100g: n["carbohydrates_100g"] ?? 0,
      lipidesG100g: n["fat_100g"] ?? 0,
      fibresG100g: n["fiber_100g"] ?? null,
    };
  } catch (erreur) {
    console.error("Échec de la récupération du produit Open Food Facts", erreur);
    return null;
  }
}
