"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ajouterRepas } from "@/server/actions/meals";
import { analyserPhoto } from "@/server/actions/scan";
import type { AnalyseRepas, NiveauConfiance } from "@/server/foodAnalysis/schema";

type MealType = "PETIT_DEJ" | "DEJEUNER" | "DINER" | "COLLATION";

const TYPES: { value: MealType; label: string }[] = [
  { value: "PETIT_DEJ", label: "Petit-déjeuner" },
  { value: "DEJEUNER", label: "Déjeuner" },
  { value: "DINER", label: "Dîner" },
  { value: "COLLATION", label: "Collation" },
];

function deviserTypeParHeure(): MealType {
  const heure = new Date().getHours();
  if (heure < 11) return "PETIT_DEJ";
  if (heure < 15) return "DEJEUNER";
  if (heure < 19) return "COLLATION";
  return "DINER";
}

const LIBELLES_CONFIANCE: Record<NiveauConfiance, string> = { haute: "Fiable", moyenne: "À vérifier", basse: "Incertain" };
const COULEURS_CONFIANCE: Record<NiveauConfiance, string> = {
  haute: "bg-sarcelle-100 text-sarcelle-600",
  moyenne: "bg-ambre-300/40 text-charbon-600",
  basse: "bg-corail-100 text-corail-600",
};

interface ItemEditable {
  nom: string;
  quantiteG: number;
  // Valeurs par gramme, dérivées de l'estimation initiale : permet de recalculer
  // calories/macros en direct quand l'utilisateur ajuste la quantité.
  calParG: number;
  proteinesParG: number;
  glucidesParG: number;
  lipidesParG: number;
  confiance: NiveauConfiance;
}

function versItemsEditables(analyse: AnalyseRepas): ItemEditable[] {
  return analyse.ingredients.map((ing) => {
    const grammage = ing.quantiteEstimeeG > 0 ? ing.quantiteEstimeeG : 100;
    return {
      nom: ing.nom,
      quantiteG: grammage,
      calParG: ing.calories / grammage,
      proteinesParG: ing.proteinesG / grammage,
      glucidesParG: ing.glucidesG / grammage,
      lipidesParG: ing.lipidesG / grammage,
      confiance: ing.confiance,
    };
  });
}

export function EcranScan() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [etat, setEtat] = useState<"inactif" | "analyse" | "resultat" | "erreur">("inactif");
  const [erreur, setErreur] = useState<string | null>(null);
  const [nomPlat, setNomPlat] = useState("");
  const [confianceGlobale, setConfianceGlobale] = useState<NiveauConfiance>("haute");
  const [items, setItems] = useState<ItemEditable[]>([]);
  const [type, setType] = useState<MealType>(deviserTypeParHeure);
  const [enregistrement, setEnregistrement] = useState(false);
  const [modeCorrection, setModeCorrection] = useState(false);

  function ouvrirCapture() {
    inputRef.current?.click();
  }

  async function onFichierChoisi(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;

    setEtat("analyse");
    setErreur(null);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const lecteur = new FileReader();
        lecteur.onload = () => resolve(lecteur.result as string);
        lecteur.onerror = () => reject(new Error("Impossible de lire l'image."));
        lecteur.readAsDataURL(fichier);
      });

      const [entete, base64] = dataUrl.split(",");
      const mediaType = /data:(.*);base64/.exec(entete)?.[1] ?? fichier.type;

      const analyse = await analyserPhoto({ imageBase64: base64, mediaType });

      setNomPlat(analyse.nomPlat || "Repas");
      setConfianceGlobale(analyse.confianceGlobale);
      setItems(versItemsEditables(analyse));
      setModeCorrection(analyse.confianceGlobale === "basse");
      setEtat("resultat");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "L'analyse a échoué, réessaie.");
      setEtat("erreur");
    }
  }

  function majQuantite(index: number, quantiteG: number) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, quantiteG: Math.max(0, quantiteG) } : it)));
  }

  function supprimerItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totaux = items.reduce(
    (acc, it) => ({
      calories: acc.calories + it.calParG * it.quantiteG,
      proteinesG: acc.proteinesG + it.proteinesParG * it.quantiteG,
      glucidesG: acc.glucidesG + it.glucidesParG * it.quantiteG,
      lipidesG: acc.lipidesG + it.lipidesParG * it.quantiteG,
    }),
    { calories: 0, proteinesG: 0, glucidesG: 0, lipidesG: 0 },
  );

  async function valider() {
    if (items.length === 0) return;
    setEnregistrement(true);
    try {
      await ajouterRepas({
        date: new Date().toISOString().slice(0, 10),
        type,
        items: items.map((it) => ({
          nomLibre: it.nom,
          quantiteG: it.quantiteG,
          caloriesKcal: Math.round(it.calParG * it.quantiteG),
          proteinesG: Math.round(it.proteinesParG * it.quantiteG),
          glucidesG: Math.round(it.glucidesParG * it.quantiteG),
          lipidesG: Math.round(it.lipidesParG * it.quantiteG),
        })),
      });
      router.push("/accueil");
      router.refresh();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
      setEnregistrement(false);
    }
  }

  if (etat === "resultat") {
    return (
      <div className="mx-auto min-h-screen max-w-md space-y-6 bg-creme-100 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Link
            href="/accueil"
            aria-label="Annuler"
            className="flex h-11 w-11 items-center justify-center text-2xl text-charbon-800"
          >
            ✕
          </Link>
          <span className="font-titre font-semibold text-charbon-800">Résultat du scan</span>
          <div className="w-11" />
        </div>

        {confianceGlobale === "basse" ? (
          <div className="rounded-2xl bg-corail-50 p-4 text-sm text-corail-600">
            Estimation peu fiable sur cette photo — vérifie et corrige les quantités avant de valider.
          </div>
        ) : null}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-titre text-xl font-semibold text-charbon-800">{nomPlat}</h1>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${COULEURS_CONFIANCE[confianceGlobale]}`}>
              {LIBELLES_CONFIANCE[confianceGlobale]}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`min-h-11 rounded-full border px-3 text-sm font-medium ${
                type === t.value ? "border-corail-500 bg-corail-500 text-white" : "border-creme-200 bg-creme-50 text-charbon-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-creme-50 p-5 shadow-sm">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="font-titre text-3xl font-bold text-charbon-800">{Math.round(totaux.calories)}</p>
            <p className="text-sm text-charbon-400">calories estimées</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-xl bg-creme-50 p-3">
            <p className="font-semibold text-charbon-800">{Math.round(totaux.proteinesG)}g</p>
            <p className="text-xs text-charbon-400">Protéines</p>
          </div>
          <div className="rounded-xl bg-creme-50 p-3">
            <p className="font-semibold text-charbon-800">{Math.round(totaux.glucidesG)}g</p>
            <p className="text-xs text-charbon-400">Glucides</p>
          </div>
          <div className="rounded-xl bg-creme-50 p-3">
            <p className="font-semibold text-charbon-800">{Math.round(totaux.lipidesG)}g</p>
            <p className="text-xs text-charbon-400">Lipides</p>
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-titre font-semibold text-charbon-800">Ingrédients détectés</h2>
          {items.length === 0 ? (
            <p className="text-sm text-charbon-400">Aucun ingrédient détecté sur cette photo.</p>
          ) : (
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-creme-50 p-3 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-medium text-charbon-800">{it.nom}</p>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${COULEURS_CONFIANCE[it.confiance]}`}>
                        {LIBELLES_CONFIANCE[it.confiance]}
                      </span>
                    </div>
                    <p className="text-xs text-charbon-400">{Math.round(it.calParG * it.quantiteG)} kcal</p>
                  </div>
                  {modeCorrection ? (
                    <>
                      <input
                        type="number"
                        value={Math.round(it.quantiteG)}
                        onChange={(e) => majQuantite(i, Number(e.target.value) || 0)}
                        className="w-16 rounded-lg border border-creme-200 p-1.5 text-right text-sm"
                      />
                      <span className="text-xs text-charbon-400">g</span>
                      <button onClick={() => supprimerItem(i)} className="px-1 text-corail-600" aria-label="Supprimer">
                        ✕
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-charbon-400">{Math.round(it.quantiteG)} g</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <Link href="/journal/ajouter" className="mt-2 block text-center text-sm font-medium text-corail-600 hover:underline">
            + Ajouter un aliment oublié
          </Link>
        </div>

        {erreur ? <p className="text-center text-corail-600">{erreur}</p> : null}

        <div className="flex gap-3 pb-6">
          <button
            onClick={() => setModeCorrection((m) => !m)}
            className="flex-1 rounded-2xl bg-creme-200 py-3.5 font-titre font-semibold text-charbon-800"
          >
            {modeCorrection ? "Terminer la correction" : "Corriger"}
          </button>
          <button
            onClick={valider}
            disabled={enregistrement || items.length === 0}
            className="flex-1 rounded-2xl bg-corail-500 py-3.5 font-titre font-semibold text-white disabled:opacity-50"
          >
            {enregistrement ? "Ajout..." : "Terminé"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-charbon-800 text-creme-50">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFichierChoisi} />

      <div className="flex items-center justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <Link href="/accueil" aria-label="Fermer" className="flex h-11 w-11 items-center justify-center text-2xl">
          ✕
        </Link>
        <span className="font-titre font-semibold">Assiettly</span>
        <span className="w-11" />
      </div>

      <div className="relative mx-4 flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-charbon-600 to-charbon-800">
        <div className="flex h-full items-center justify-center px-8 text-center text-sm text-charbon-400">
          {etat === "analyse" ? (
            <div className="space-y-3">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-creme-50 border-t-transparent" />
              <p>Analyse de ta photo en cours…</p>
            </div>
          ) : etat === "erreur" ? (
            <div className="space-y-3">
              <p className="text-corail-400">{erreur}</p>
              <button
                onClick={() => setEtat("inactif")}
                className="min-h-11 rounded-xl bg-creme-50 px-4 font-semibold text-charbon-800"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <p>Prends ton repas en photo pour estimer calories et macros.</p>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-center gap-6">
          <button onClick={ouvrirCapture} disabled={etat === "analyse"} aria-label="Prendre une photo" className="h-16 w-16 rounded-full border-4 border-creme-50 bg-transparent disabled:opacity-50" />
        </div>
        <p className="text-center text-xs text-charbon-400">Code-barres et étiquette nutritionnelle — bientôt disponibles</p>
      </div>
    </div>
  );
}
