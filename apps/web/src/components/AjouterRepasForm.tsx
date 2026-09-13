"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { aujourdHuiLocal } from "@/lib/date";
import { ajouterRepas, chercherParCodeBarre, rechercherAliments } from "@/server/actions/meals";

type MealType = "PETIT_DEJ" | "DEJEUNER" | "DINER" | "COLLATION";

const TYPES: { value: MealType; label: string }[] = [
  { value: "PETIT_DEJ", label: "Petit-déjeuner" },
  { value: "DEJEUNER", label: "Déjeuner" },
  { value: "DINER", label: "Dîner" },
  { value: "COLLATION", label: "Collation" },
];

interface FoodResult {
  id: string;
  nom: string;
  marque: string | null;
  caloriesKcal100g: unknown;
}

interface ItemPanier {
  foodId?: string;
  quantiteG: number;
  nom: string;
}

export function AjouterRepasForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<MealType>("DEJEUNER");
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<FoodResult[]>([]);
  const [codeBarre, setCodeBarre] = useState("");
  const [panier, setPanier] = useState<ItemPanier[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  async function onRecherche(texte: string) {
    setRecherche(texte);
    if (texte.trim().length < 2) {
      setResultats([]);
      return;
    }
    const res = await rechercherAliments(texte);
    setResultats(res as FoodResult[]);
  }

  function ajouterAuPanier(food: FoodResult, quantiteG = 100) {
    setPanier((p) => [
      ...p,
      {
        foodId: food.id,
        quantiteG,
        nom: `${food.nom}${food.marque ? ` (${food.marque})` : ""}`,
      },
    ]);
    setRecherche("");
    setResultats([]);
  }

  function majQuantite(index: number, quantiteG: number) {
    setPanier((p) => p.map((item, i) => (i === index ? { ...item, quantiteG } : item)));
  }

  async function onCodeBarre() {
    if (!codeBarre.trim()) return;
    setErreur(null);
    const food = await chercherParCodeBarre(codeBarre.trim());
    if (!food) {
      setErreur("Produit introuvable pour ce code-barres.");
      return;
    }
    ajouterAuPanier(food as FoodResult);
    setCodeBarre("");
  }

  function retirer(index: number) {
    setPanier((p) => p.filter((_, i) => i !== index));
  }

  function valider() {
    if (panier.length === 0) return;
    setErreur(null);
    startTransition(async () => {
      try {
        await ajouterRepas({
          date: aujourdHuiLocal(),
          type,
          items: panier.map(({ foodId, quantiteG }) => ({ foodId, quantiteG })),
        });
        router.push("/journal");
      } catch (e) {
        setErreur(e instanceof Error ? e.message : "Erreur lors de l'ajout du repas");
      }
    });
  }

  return (
    <div className="space-y-6 pb-32">
      <h1 className="font-titre text-2xl font-semibold text-charbon-800">Ajouter un repas</h1>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`min-h-11 rounded-full border px-3 text-sm font-medium ${
              type === t.value
                ? "border-corail-500 bg-corail-500 text-white"
                : "border-creme-200 bg-creme-50 text-charbon-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-charbon-800">Rechercher un aliment</label>
        <input
          className="w-full rounded-xl border border-creme-200 bg-creme-50 p-3"
          placeholder="ex : pain au chocolat, yaourt..."
          value={recherche}
          onChange={(e) => onRecherche(e.target.value)}
        />
        <div className="mt-2 space-y-2">
          {resultats.map((food) => (
            <button
              key={food.id}
              onClick={() => ajouterAuPanier(food)}
              className="block w-full rounded-xl bg-creme-50 p-3 text-left shadow-sm hover:bg-creme-200"
            >
              <span className="font-medium text-charbon-800">
                {food.nom}
                {food.marque ? ` — ${food.marque}` : ""}
              </span>
              <span className="ml-2 text-sm text-charbon-400">
                {Math.round(Number(food.caloriesKcal100g))} kcal / 100 g
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-charbon-800">Ou scanner un code-barres</label>
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border border-creme-200 bg-creme-50 p-3"
            placeholder="Code-barres (EAN)"
            value={codeBarre}
            onChange={(e) => setCodeBarre(e.target.value)}
          />
          <button onClick={onCodeBarre} className="rounded-xl bg-charbon-800 px-5 font-semibold text-white">
            OK
          </button>
        </div>
      </div>

      {panier.length > 0 ? (
        <div>
          <label className="mb-2 block text-sm font-semibold text-charbon-800">Repas en cours</label>
          <div className="space-y-2">
            {panier.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-creme-50 p-3 shadow-sm">
                <span className="min-w-0 flex-1 truncate">{item.nom}</span>
                <input
                  type="number"
                  className="w-20 rounded-lg border border-creme-200 p-1.5 text-right"
                  value={item.quantiteG}
                  onChange={(e) => majQuantite(i, Number(e.target.value) || 0)}
                />
                <span className="text-sm text-charbon-400">g</span>
                <button
                  onClick={() => retirer(i)}
                  aria-label={`Retirer ${item.nom}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center text-corail-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {erreur ? <p className="text-corail-600">{erreur}</p> : null}

      {/* Positionné au-dessus de la barre de navigation basse (fixe elle aussi)
          plutôt qu'en bottom-0, pour ne jamais la recouvrir ni être recouvert
          par elle — 64px correspond à la hauteur de son contenu, avant sa
          propre zone de sécurité en bas. */}
      <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] border-t border-creme-200 bg-creme-100 p-4">
        <button
          onClick={valider}
          disabled={panier.length === 0 || isPending}
          className="mx-auto block w-full max-w-4xl rounded-2xl bg-corail-500 py-4 font-titre font-semibold text-white shadow-sm disabled:opacity-50"
        >
          {isPending ? "Ajout en cours..." : `Valider le repas (${panier.length})`}
        </button>
      </div>
    </div>
  );
}
