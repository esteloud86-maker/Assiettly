import Link from "next/link";
import { TARIFS } from "@/lib/pricing";

const AVANTAGES_PREMIUM = ["Scans de repas par photo illimités", "Badges exclusifs et défis entre amis (bientôt)"];

/**
 * Présentées comme des "formules" de carte (menu/semaine) plutôt que deux
 * cartes identiques empilées : une liste à filets, l'annuelle distinguée
 * par une bordure d'accent plutôt qu'un badge flottant générique.
 */
export function Tarifs() {
  return (
    <section id="tarifs" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-chalk text-sm font-semibold text-corail-700">Les formules</p>
      <h2 className="mt-1 font-titre text-3xl font-bold text-charbon-800">Un tarif simple, sans piège</h2>
      <p className="mt-3 font-titre text-lg font-semibold text-charbon-800">
        Essai gratuit de {TARIFS.essaiJours} jours
      </p>
      <p className="text-charbon-400">Sans carte bancaire.</p>

      <div className="mt-8 divide-y divide-charbon-400/15 overflow-hidden rounded-3xl bg-creme-50 shadow-sm">
        <div className="p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-titre text-lg font-semibold text-charbon-800">Premium mensuel</p>
            <p className="font-titre text-2xl font-bold text-charbon-800">
              {TARIFS.mensuel.prixAffiche}
              <span className="text-sm font-normal text-charbon-400">{TARIFS.mensuel.periode}</span>
            </p>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-charbon-600">
            {AVANTAGES_PREMIUM.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-charbon-400">Résiliable à tout moment, sans engagement.</p>
          <Link
            href="/inscription"
            className="mt-4 block rounded-2xl border border-charbon-400/20 bg-white py-3 text-center font-titre font-semibold text-charbon-800 hover:bg-creme-200"
          >
            Essayer gratuitement
          </Link>
        </div>

        <div className="border-l-4 border-corail-500 bg-corail-50/60 p-6 pl-5">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <p className="font-titre text-lg font-semibold text-corail-600">Premium annuel</p>
            <span className="font-chalk text-sm font-semibold text-corail-700">le plus choisi</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs text-charbon-400">
              Soit {TARIFS.annuel.equivalentMensuel} — environ -{TARIFS.annuel.reductionPct}&nbsp;% vs mensuel.
            </p>
            <p className="shrink-0 font-titre text-2xl font-bold text-charbon-800">
              {TARIFS.annuel.prixAffiche}
              <span className="text-sm font-normal text-charbon-400">{TARIFS.annuel.periode}</span>
            </p>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-charbon-600">
            {AVANTAGES_PREMIUM.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-charbon-400">Résiliable à tout moment.</p>
          <Link
            href="/inscription"
            className="mt-4 block rounded-2xl bg-corail-500 py-3 text-center font-titre font-semibold text-white hover:bg-corail-600"
          >
            Essayer gratuitement
          </Link>
        </div>
      </div>
    </section>
  );
}
