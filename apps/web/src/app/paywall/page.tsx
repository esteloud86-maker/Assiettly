import Link from "next/link";
import { redirect } from "next/navigation";
import { demarrerAbonnement } from "@/server/actions/billing";
import { requireProfile } from "@/server/auth";
import { estPremium } from "@/server/billing";

const AVANTAGES_PREMIUM = [
  "Scans de repas par photo illimités",
  "Historique complet et export de tes données",
  "Coach IA pour ajuster tes objectifs",
  "Badges exclusifs et défis entre amis (bientôt)",
];

export default async function PaywallPage() {
  const profile = await requireProfile();
  if (estPremium(profile.subscription)) redirect("/accueil");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-center font-titre text-3xl font-bold text-charbon-800">
        Essaie Assiettly Premium gratuitement
      </h1>
      <p className="mt-2 text-center text-charbon-400">7 jours offerts, sans engagement.</p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-creme-50 p-5">
          <p className="font-titre font-semibold text-charbon-800">Gratuit</p>
          <p className="mt-1 text-sm text-charbon-400">3 scans par semaine, journal et flamme illimités.</p>
        </div>
        <div className="rounded-2xl border-2 border-corail-500 bg-corail-50 p-5">
          <p className="font-titre font-semibold text-corail-600">Premium</p>
          <ul className="mt-1 space-y-1 text-sm text-charbon-600">
            {AVANTAGES_PREMIUM.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <form action={demarrerAbonnement.bind(null, "annuel")}>
          <button type="submit" className="w-full rounded-2xl bg-corail-500 py-4 font-titre font-semibold text-white">
            Essai gratuit — puis 49,99€/an
          </button>
        </form>
        <form action={demarrerAbonnement.bind(null, "mensuel")}>
          <button
            type="submit"
            className="w-full rounded-2xl border border-creme-200 bg-creme-50 py-4 font-titre font-semibold text-charbon-800"
          >
            Essai gratuit — puis 6,99€/mois
          </button>
        </form>
      </div>

      <Link href="/accueil" className="mt-6 text-center text-sm font-medium text-charbon-400 underline">
        Continuer avec la formule gratuite
      </Link>
    </div>
  );
}
