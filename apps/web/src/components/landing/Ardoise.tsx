"use client";

import Image from "next/image";
import { useState } from "react";
import { PLATS_DEMO } from "@/data/demoScanPlats";

const LIBELLE_CONFIANCE: Record<"elevee" | "moyenne" | "faible", string> = {
  elevee: "Confiance élevée",
  moyenne: "Confiance moyenne",
  faible: "Confiance faible",
};

// Couleurs choisies pour un contraste AA (4.5:1+) sur fond sombre
// (charbon-800) — sarcelle-500 seul échoue (2.98:1), sarcelle-400 passe.
const COULEUR_CONFIANCE: Record<"elevee" | "moyenne" | "faible", string> = {
  elevee: "text-sarcelle-400",
  moyenne: "text-ambre-500",
  faible: "text-corail-400",
};

/**
 * L'ardoise — le geste audacieux de la page (cf. plan de design). Une carte
 * de brasserie : 6 plats réels, listés comme des prix sur une ardoise, mais
 * ce sont des kcal mesurées par Assiettly sur CES photos précises. Toucher
 * un plat ouvre le détail (ingrédients, P/G/L, confiance) sans quitter
 * l'ardoise — pas de survol requis, utilisable au doigt dès 320px.
 *
 * Règle d'honnêteté : ce n'est pas un appel IA en direct (ça ralentirait le
 * hero et coûterait un appel Anthropic par visiteur). Tant qu'un plat n'a
 * pas de résultat réel dans `demoScanPlats.ts`, on affiche "bientôt" plutôt
 * qu'un chiffre inventé.
 */
export function Ardoise() {
  const [ouvertId, setOuvertId] = useState<string | null>(null);
  // Photos chargées avec succès : contrôle le fondu d'entrée. Tant qu'une
  // photo n'a pas fini de décoder, son emplacement reste un simple fond
  // ivoire (aucun emoji, aucune icône — la zone est réservée dès le premier
  // rendu via le wrapper h-16 w-16 ci-dessous, donc aucun saut de mise en
  // page non plus).
  const [chargees, setChargees] = useState<Set<string>>(new Set());

  return (
    <div className="relative rounded-3xl bg-charbon-800 px-5 py-6 text-creme-100 shadow-lg shadow-charbon-800/20 sm:px-8 sm:py-8">
      <p className="font-chalk text-sm font-semibold tracking-wide text-ambre-300">La carte du jour</p>

      <ul className="mt-3">
        {PLATS_DEMO.map((plat, i) => {
          const ouvert = ouvertId === plat.id;
          const resultat = plat.resultat;

          return (
            <li key={plat.id} className="border-b border-creme-100/10 last:border-0">
              <button
                type="button"
                onClick={() => setOuvertId(ouvert ? null : plat.id)}
                aria-expanded={ouvert}
                aria-controls={`ardoise-detail-${plat.id}`}
                className="ardoise-ligne flex min-h-[44px] w-full items-baseline gap-2 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambre-300"
                style={{ animationDelay: `${i * 110}ms` }}
              >
                <span className="min-w-0 font-titre text-[15px] font-medium leading-snug sm:text-base">
                  {plat.nom}
                </span>
                <span aria-hidden="true" className="mb-[5px] flex-1 border-b border-dotted border-creme-100/30" />
                <span className="shrink-0 font-titre text-[15px] font-semibold tabular-nums sm:text-base">
                  {resultat ? `${resultat.caloriesKcal} kcal` : "bientôt"}
                </span>
              </button>

              {ouvert && resultat ? (
                <div id={`ardoise-detail-${plat.id}`} className="ardoise-detail mb-3 rounded-2xl bg-creme-100/[0.06] p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-creme-100">
                      <Image
                        src={plat.image}
                        alt={plat.nom}
                        fill
                        sizes="64px"
                        className={`object-cover transition-opacity duration-300 motion-reduce:transition-none ${
                          chargees.has(plat.id) ? "opacity-100" : "opacity-0"
                        }`}
                        onLoad={() => setChargees((s) => new Set(s).add(plat.id))}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium ${COULEUR_CONFIANCE[resultat.confiance]}`}>
                        {LIBELLE_CONFIANCE[resultat.confiance]}
                      </p>
                      <p className="mt-0.5 text-sm text-creme-100/80">
                        P {Math.round(resultat.proteinesG)}g · G {Math.round(resultat.glucidesG)}g · L{" "}
                        {Math.round(resultat.lipidesG)}g
                      </p>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {resultat.ingredients.map((ing) => (
                      <li key={ing.nom} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-creme-100/80">{ing.nom}</span>
                        <span className="shrink-0 tabular-nums text-creme-100/50">{Math.round(ing.calories)} kcal</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-3 text-xs text-creme-100/50">
                    Un doute sur un ingrédient ou une quantité ? Corrige en 2 taps dans l'app.
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-creme-100/60">Résultats issus de nos tests sur ces photos — pas un direct.</p>
    </div>
  );
}
