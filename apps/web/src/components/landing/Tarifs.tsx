import Link from "next/link";

const AVANTAGES_PREMIUM = [
  "Scans de repas par photo illimités",
  "Historique complet et export de tes données",
  "Coach IA pour ajuster tes objectifs",
  "Badges exclusifs et défis entre amis (bientôt)",
];

export function Tarifs() {
  return (
    <section id="tarifs" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-titre text-3xl font-bold text-charbon-800">Un tarif simple, sans piège</h2>
      <p className="mt-2 text-center text-charbon-400">7 jours d&rsquo;essai Premium offerts à l&rsquo;inscription.</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col rounded-3xl bg-creme-50 p-6 shadow-sm">
          <p className="font-titre text-lg font-semibold text-charbon-800">Gratuit</p>
          <p className="mt-1 font-titre text-2xl font-bold text-charbon-800">0€</p>
          <p className="mt-3 text-sm text-charbon-600">
            Journal et flamme illimités, 3 scans de repas par semaine.
          </p>
          {/* `mt-auto` aligne ce bouton sur celui de la carte Premium, quelle
              que soit la longueur du contenu au-dessus dans chaque carte. */}
          <Link
            href="/inscription"
            className="mt-auto block rounded-2xl border border-creme-200 bg-white py-3 text-center font-titre font-semibold text-charbon-800 hover:bg-creme-200"
          >
            Commencer gratuitement
          </Link>
        </div>

        <div className="relative flex flex-col rounded-3xl border-2 border-corail-500 bg-corail-50 p-6 shadow-sm">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-corail-500 px-3 py-1 text-xs font-semibold text-white">
            Populaire
          </span>
          <p className="font-titre text-lg font-semibold text-corail-600">Premium</p>
          <p className="mt-1 font-titre text-2xl font-bold text-charbon-800">
            6,99€<span className="text-sm font-normal text-charbon-400">/mois</span>
          </p>
          <p className="text-xs text-charbon-400">ou 49,99€/an</p>
          <ul className="mt-3 space-y-1.5 text-sm text-charbon-600">
            {AVANTAGES_PREMIUM.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>
          <Link
            href="/inscription"
            className="mt-6 block rounded-2xl bg-corail-500 py-3 text-center font-titre font-semibold text-white hover:bg-corail-600"
          >
            Essayer gratuitement
          </Link>
        </div>
      </div>
    </section>
  );
}
