import Link from "next/link";
import { SCANS_GRATUITS_PAR_JOUR, TARIFS } from "@/lib/pricing";

const AVANTAGES_PREMIUM = ["Scans de repas par photo illimités", "Badges exclusifs et défis entre amis (bientôt)"];

export function Tarifs() {
  return (
    <section id="tarifs" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-titre text-3xl font-bold text-charbon-800">Un tarif simple, sans piège</h2>
      <p className="mt-2 text-center text-charbon-400">
        {TARIFS.essaiJours} jours d&rsquo;essai complet, sans carte bancaire.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col rounded-3xl bg-creme-50 p-6 shadow-sm">
          <p className="font-titre text-lg font-semibold text-charbon-800">Essai gratuit — {TARIFS.essaiJours} jours</p>
          <p className="mt-1 font-titre text-2xl font-bold text-charbon-800">0€</p>
          <p className="mt-3 text-sm text-charbon-600">
            Accès complet pendant {TARIFS.essaiJours} jours. Pas de carte bancaire à l&rsquo;inscription.
          </p>
          <p className="mt-3 text-xs text-charbon-400">
            Après l&rsquo;essai, si tu ne t&rsquo;abonnes pas, l&rsquo;app reste utilisable en mode limité (
            {SCANS_GRATUITS_PAR_JOUR} scans par jour, journal et flamme illimités) — ta flamme ne s&rsquo;éteint
            pas pour autant.
          </p>
          <Link
            href="/inscription"
            className="mt-auto block rounded-2xl border border-creme-200 bg-white py-3 text-center font-titre font-semibold text-charbon-800 hover:bg-creme-200"
          >
            Essayer gratuitement
          </Link>
        </div>

        <div className="flex flex-col rounded-3xl bg-creme-50 p-6 shadow-sm">
          <p className="font-titre text-lg font-semibold text-charbon-800">Premium mensuel</p>
          <p className="mt-1 font-titre text-2xl font-bold text-charbon-800">
            {TARIFS.mensuel.prixAffiche}
            <span className="text-sm font-normal text-charbon-400">{TARIFS.mensuel.periode}</span>
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-charbon-600">
            {AVANTAGES_PREMIUM.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-charbon-400">Résiliable à tout moment, sans engagement.</p>
          <Link
            href="/inscription"
            className="mt-auto block rounded-2xl border border-creme-200 bg-white py-3 text-center font-titre font-semibold text-charbon-800 hover:bg-creme-200"
          >
            Essayer gratuitement
          </Link>
        </div>

        <div className="relative flex flex-col rounded-3xl border-2 border-corail-500 bg-corail-50 p-6 shadow-sm">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-corail-500 px-3 py-1 text-xs font-semibold text-white">
            Le plus choisi
          </span>
          <p className="font-titre text-lg font-semibold text-corail-600">Premium annuel</p>
          <p className="mt-1 font-titre text-2xl font-bold text-charbon-800">
            {TARIFS.annuel.prixAffiche}
            <span className="text-sm font-normal text-charbon-400">{TARIFS.annuel.periode}</span>
          </p>
          <p className="text-xs text-charbon-400">
            Soit {TARIFS.annuel.equivalentMensuel} — environ -{TARIFS.annuel.reductionPct}&nbsp;% vs mensuel.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-charbon-600">
            {AVANTAGES_PREMIUM.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-charbon-400">Résiliable à tout moment.</p>
          <Link
            href="/inscription"
            className="mt-auto block rounded-2xl bg-corail-500 py-3 text-center font-titre font-semibold text-white hover:bg-corail-600"
          >
            Essayer gratuitement
          </Link>
        </div>
      </div>
    </section>
  );
}
