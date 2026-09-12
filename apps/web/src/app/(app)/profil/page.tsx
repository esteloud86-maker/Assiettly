import { NotificationsToggle } from "@/components/NotificationsToggle";
import { ouvrirPortailAbonnement } from "@/server/actions/billing";
import { requireProfile } from "@/server/auth";
import { estPremium } from "@/server/billing";

const LIBELLES_OBJECTIF: Record<string, string> = {
  PERTE: "Perte de poids",
  MAINTIEN: "Maintien",
  PRISE_MASSE: "Prise de masse",
};

export default async function ProfilPage() {
  const profile = await requireProfile();
  const premium = estPremium(profile.subscription);

  return (
    <div className="space-y-6">
      <h1 className="font-titre text-2xl font-semibold text-charbon-800">Mon profil</h1>

      <div className="space-y-2 rounded-2xl bg-creme-50 p-6 shadow-sm">
        <p className="font-semibold text-charbon-800">{profile.email}</p>
        {profile.objectifType ? (
          <p className="text-charbon-400">Objectif : {LIBELLES_OBJECTIF[profile.objectifType]}</p>
        ) : null}
        {profile.goals[0] ? (
          <p className="text-charbon-400">{profile.goals[0].objectifCaloriesKcal} kcal / jour</p>
        ) : null}
      </div>

      <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
        <h2 className="mb-2 font-titre font-semibold text-charbon-800">Abonnement</h2>
        {premium ? (
          <>
            <p className="mb-4 text-sarcelle-500">
              {profile.subscription?.status === "TRIALING" ? "Essai gratuit en cours ✨" : "Abonnement actif ✨"}
            </p>
            <form action={ouvrirPortailAbonnement}>
              <button type="submit" className="rounded-xl bg-charbon-800 px-5 py-2.5 font-semibold text-white">
                Gérer mon abonnement
              </button>
            </form>
          </>
        ) : (
          <p className="text-charbon-400">Aucun abonnement actif.</p>
        )}
      </div>

      <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
        <h2 className="mb-2 font-titre font-semibold text-charbon-800">Notifications</h2>
        <NotificationsToggle />
      </div>

      <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
        <h2 className="mb-2 font-titre font-semibold text-charbon-800">Données &amp; confidentialité</h2>
        <p className="text-sm text-charbon-400">
          Conformément au RGPD, tu peux demander l&rsquo;export ou la suppression de tes données à tout moment.
        </p>
      </div>
    </div>
  );
}
