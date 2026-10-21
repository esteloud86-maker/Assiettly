"use client";

import { useState } from "react";
import { PLATS_DEMO } from "@/data/demoScanPlats";

type EtatPhoto = "chargement" | "chargee" | "absente";

const LIBELLE_CONFIANCE: Record<"elevee" | "moyenne" | "faible", string> = {
  elevee: "Confiance : élevée",
  moyenne: "Confiance : moyenne",
  faible: "Confiance : faible",
};

/**
 * Démo de scan interactive du hero — le geste audacieux de la page (cf.
 * plan de design). Le visiteur choisit une vraie photo de plat français et
 * voit le vrai résultat mesuré par Assiettly sur cette photo précise.
 *
 * Règle d'honnêteté : ce n'est pas un appel IA en direct (ça ralentirait le
 * hero et coûterait un appel Anthropic par visiteur), donc la page le dit
 * clairement. Tant qu'un plat n'a pas de résultat réel renseigné dans
 * `demoScanPlats.ts`, on affiche "résultat à venir" plutôt qu'un chiffre
 * inventé.
 */
export function DemoScan() {
  const [selectionId, setSelectionId] = useState(PLATS_DEMO[0].id);
  const [etatPhoto, setEtatPhoto] = useState<EtatPhoto>("chargement");
  const plat = PLATS_DEMO.find((p) => p.id === selectionId) ?? PLATS_DEMO[0];

  function choisir(id: string) {
    setSelectionId(id);
    setEtatPhoto("chargement");
  }

  return (
    <div className="rounded-3xl bg-creme-50 p-4 shadow-sm sm:p-5">
      <p className="text-sm font-medium text-charbon-800">Choisis un plat, regarde le résultat.</p>

      <div
        role="group"
        aria-label="Plats de la démo"
        className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {PLATS_DEMO.map((p) => {
          const actif = p.id === selectionId;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={actif}
              onClick={() => choisir(p.id)}
              className={`flex h-14 w-14 shrink-0 scroll-ml-4 snap-start items-center justify-center rounded-2xl text-2xl transition-colors motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corail-500 ${
                actif ? "bg-corail-100 ring-2 ring-corail-500" : "bg-creme-100 hover:bg-creme-200"
              }`}
            >
              <span aria-hidden="true">{p.emoji}</span>
              <span className="sr-only">{p.nom}</span>
            </button>
          );
        })}
      </div>

      <div
        key={plat.id}
        className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm transition-opacity motion-reduce:transition-none"
      >
        <div className="relative aspect-[4/3] w-full bg-creme-100">
          {/* Repli visuel tant que la vraie photo n'est pas déposée dans
              /public/landing/demo/ (cf. data/demoScanPlats.ts) — jamais
              d'icône d'image cassée : l'emoji remplit la zone tant que la
              vraie photo n'a pas fini de charger avec succès. */}
          <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-6xl">
            {plat.emoji}
          </div>
          {etatPhoto !== "absente" ? (
            // eslint-disable-next-line @next/next/no-img-element -- photos déposées à la main dans /public, next/image n'apporte rien ici
            <img
              src={plat.image}
              alt={plat.nom}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity motion-reduce:transition-none ${
                etatPhoto === "chargee" ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setEtatPhoto("chargee")}
              onError={() => setEtatPhoto("absente")}
            />
          ) : null}
        </div>

        <div className="p-4 text-center">
          <p className="font-titre font-semibold text-charbon-800">{plat.nom}</p>

          {plat.resultat ? (
            <>
              <p className="mt-1 font-titre text-2xl font-bold text-charbon-800">
                {plat.resultat.caloriesKcal} kcal
              </p>
              <p className="mt-1 text-sm text-charbon-600">
                P {plat.resultat.proteinesG}g · G {plat.resultat.glucidesG}g · L {plat.resultat.lipidesG}g
              </p>
              <p className="mt-2 text-sm font-medium text-sarcelle-600">
                {LIBELLE_CONFIANCE[plat.resultat.confiance]}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-charbon-400">Résultat à venir.</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-charbon-400">
        Résultats issus de nos tests sur ces photos — pas un direct. Un doute sur un ingrédient ? Corrige en 2
        taps.
      </p>

      {process.env.NODE_ENV !== "production" ? (
        <p className="mt-1 text-xs font-semibold text-corail-600">
          [DEV UNIQUEMENT — ne doit jamais apparaître en prod] À remplacer par un chiffre réel une fois les tests
          effectués : écart moyen mesuré sur notre jeu de plats français, avec la méthode en une phrase.
        </p>
      ) : null}
    </div>
  );
}
