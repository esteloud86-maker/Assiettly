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
export async function recupererProduitParCodeBarre(
  codeBarre: string,
): Promise<ProduitOpenFoodFacts | null> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${codeBarre}.json`, {
    headers: { "User-Agent": "Assiettly/0.1 (contact@assiettly.fr)" },
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
}
