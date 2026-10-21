import Link from "next/link";
import { ListeFavoris } from "@/components/dashboard/ListeFavoris";
import { listerFavoris } from "@/server/actions/favoris";
import { requireProfile } from "@/server/auth";
import { estPremium } from "@/server/billing";

export default async function FavorisPage() {
  const profile = await requireProfile();
  const premium = estPremium(profile.subscription);

  if (!premium) {
    return (
      <div className="space-y-4">
        <h1 className="font-titre text-2xl font-semibold text-charbon-800">Repas favoris</h1>
        <div className="rounded-2xl bg-creme-50 p-6 text-center shadow-sm">
          <p className="font-titre font-semibold text-charbon-800">Réservé à Premium</p>
          <p className="mt-2 text-sm text-charbon-600">
            Enregistre tes repas habituels et relogue-les en un tap, sans ressaisir les quantités à chaque fois.
          </p>
          <Link
            href="/paywall?source=favoris"
            className="mt-4 inline-block rounded-2xl bg-corail-500 px-6 py-3 font-titre font-semibold text-white"
          >
            Découvrir Premium
          </Link>
        </div>
      </div>
    );
  }

  const favoris = await listerFavoris();

  return (
    <div className="space-y-4">
      <h1 className="font-titre text-2xl font-semibold text-charbon-800">Repas favoris</h1>
      {favoris.length === 0 ? (
        <p className="text-sm text-charbon-400">
          Aucun favori pour l&rsquo;instant. Depuis le détail d&rsquo;un repas déjà ajouté, touche &laquo;&nbsp;Ajouter
          aux favoris&nbsp;&raquo; pour le retrouver ici.
        </p>
      ) : (
        <ListeFavoris favoris={favoris.map((f) => ({ id: f.id, nom: f.nom, type: f.type }))} />
      )}
    </div>
  );
}
