import Link from "next/link";
import { BoutonExportDonnees } from "@/components/BoutonExportDonnees";
import { BoutonSupprimerCompte } from "@/components/BoutonSupprimerCompte";
import { NotificationsToggle } from "@/components/NotificationsToggle";
import { CarteInstallationPwa } from "@/components/onboarding/CarteInstallationPwa";
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
            {profile.stripeCustomerId ? (
              <form action={ouvrirPortailAbonnement}>
                <button type="submit" className="rounded-xl bg-charbon-800 px-5 py-2.5 font-semibold text-white">
                  Gérer mon abonnement
                </button>
              </form>
            ) : (
              // Premium obtenu uniquement via parrainage, sans être jamais
              // passé par Stripe (cf. server/actions/parrainage.ts) : pas de
              // portail d'abonnement à proposer, il n'y a rien à gérer côté
              // facturation tant que ce profil ne s'abonne pas pour de vrai.
              <p className="text-sm text-charbon-400">
                Premium offert via parrainage
                {profile.subscription?.trialEndsAt
                  ? ` jusqu'au ${profile.subscription.trialEndsAt.toLocaleDateString("fr-FR")}`
                  : ""}
                .
              </p>
            )}
          </>
        ) : (
          <p className="text-charbon-400">Aucun abonnement actif.</p>
        )}
      </div>

      <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
        <h2 className="mb-2 font-titre font-semibold text-charbon-800">Invite un ami</h2>
        <p className="mb-3 text-sm text-charbon-400">
          Un mois de Premium offert pour vous deux quand ton invité·e enregistre ses 3 premiers repas.
        </p>
        <Link href="/parrainage" className="inline-block rounded-xl bg-corail-500 px-5 py-2.5 font-semibold text-white">
          Mon lien de parrainage
        </Link>
      </div>

      <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
        <h2 className="mb-2 font-titre font-semibold text-charbon-800">Notifications</h2>
        <NotificationsToggle />
      </div>

      <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
        <h2 className="mb-2 font-titre font-semibold text-charbon-800">Installer l&rsquo;app</h2>
        <p className="mb-3 text-sm text-charbon-400">
          Garde Assiettly à portée de main, directement depuis ton écran d&rsquo;accueil.
        </p>
        <CarteInstallationPwa />
      </div>

      <div className="space-y-4 rounded-2xl bg-creme-50 p-6 shadow-sm">
        <div>
          <h2 className="mb-2 font-titre font-semibold text-charbon-800">Données &amp; confidentialité</h2>
          <p className="text-sm text-charbon-400">
            Conformément au RGPD, tu peux exporter ou supprimer tes données à tout moment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BoutonExportDonnees />
          <BoutonSupprimerCompte />
        </div>
      </div>
    </div>
  );
}
