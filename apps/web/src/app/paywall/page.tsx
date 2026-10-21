import Link from "next/link";
import { redirect } from "next/navigation";
import { BoutonAbonnement } from "@/app/paywall/BoutonAbonnement";
import { FREEZES_GRATUIT_PAR_MOIS, FREEZES_PREMIUM_PAR_MOIS, SCANS_GRATUITS_PAR_JOUR, TARIFS } from "@/lib/pricing";
import { enregistrerEvenement } from "@/server/actions/analytics";
import { demarrerAbonnement } from "@/server/actions/billing";
import { requireProfile } from "@/server/auth";
import { estPremium } from "@/server/billing";

// Copie centrée sur le bénéfice concret au moment précis où l'utilisateur en
// a besoin (cf. brief viralité) — jamais la même accroche générique partout.
// Un contexte sans entrée connue retombe sur le message générique.
const COPIE_PAR_SOURCE: Record<string, { titre: string; sousTitre: string }> = {
  scan_quota: {
    titre: "Continue à scanner sans limite",
    sousTitre: `Tu as utilisé tes ${SCANS_GRATUITS_PAR_JOUR} scans gratuits aujourd'hui.`,
  },
  freeze: {
    titre: "Garde ta flamme même les jours de resto",
    sousTitre: `${FREEZES_PREMIUM_PAR_MOIS} gels par mois au lieu de ${FREEZES_GRATUIT_PAR_MOIS} : un imprévu ne casse plus ta série.`,
  },
  favoris: {
    titre: "Relogue tes repas habituels en un tap",
    sousTitre: "Enregistre tes favoris une fois, répète-les sans ressaisir les quantités.",
  },
};

const LIGNES_COMPARATIF: { critere: string; gratuit: string; premium: string }[] = [
  { critere: "Scans de repas par photo", gratuit: `${SCANS_GRATUITS_PAR_JOUR} par jour`, premium: "Illimités" },
  { critere: "Gels de flamme par mois", gratuit: `${FREEZES_GRATUIT_PAR_MOIS}`, premium: `${FREEZES_PREMIUM_PAR_MOIS}` },
  { critere: "Repas favoris et « Répéter »", gratuit: "—", premium: "Illimités" },
  { critere: "Carte de partage", gratuit: "Avec lien Assiettly", premium: "Sans filigrane" },
  { critere: "Parrainage et groupes", gratuit: "Inclus", premium: "Inclus" },
];

export default async function PaywallPage({ searchParams }: { searchParams: { source?: string } }) {
  const profile = await requireProfile();
  if (estPremium(profile.subscription)) redirect("/accueil");

  const copie = (searchParams.source && COPIE_PAR_SOURCE[searchParams.source]) || null;
  void enregistrerEvenement("PAYWALL_VU", { source: searchParams.source ?? "generique" });

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-center font-titre text-3xl font-bold text-charbon-800">
        {copie?.titre ?? "Essaie Assiettly Premium gratuitement"}
      </h1>
      <p className="mt-2 text-center text-charbon-400">
        {copie?.sousTitre ?? `${TARIFS.essaiJours} jours offerts, sans engagement.`}
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl bg-creme-50 shadow-sm">
        <div className="grid grid-cols-3 gap-2 border-b border-creme-200 p-4 text-xs font-semibold text-charbon-400">
          <span />
          <span className="text-center">Gratuit</span>
          <span className="text-center text-corail-600">Premium</span>
        </div>
        {LIGNES_COMPARATIF.map((ligne) => (
          <div key={ligne.critere} className="grid grid-cols-3 gap-2 border-b border-creme-200 p-4 text-sm last:border-0">
            <span className="text-charbon-800">{ligne.critere}</span>
            <span className="text-center text-charbon-400">{ligne.gratuit}</span>
            <span className="text-center font-semibold text-corail-600">{ligne.premium}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <form action={demarrerAbonnement.bind(null, "annuel")}>
          <BoutonAbonnement className="w-full rounded-2xl bg-corail-500 py-4 font-titre font-semibold text-white">
            Essai gratuit — puis {TARIFS.annuel.prixAffiche}
            {TARIFS.annuel.periode} (soit {TARIFS.annuel.equivalentMensuel})
          </BoutonAbonnement>
        </form>
        <form action={demarrerAbonnement.bind(null, "mensuel")}>
          <BoutonAbonnement className="w-full rounded-2xl border border-creme-200 bg-creme-50 py-4 font-titre font-semibold text-charbon-800">
            Essai gratuit — puis {TARIFS.mensuel.prixAffiche}
            {TARIFS.mensuel.periode}
          </BoutonAbonnement>
        </form>
        <p className="text-center text-xs text-charbon-400">
          {TARIFS.essaiJours} jours d&rsquo;essai, puis renouvellement automatique à ce tarif jusqu&rsquo;à
          résiliation. Résiliable en un clic depuis ton profil, à tout moment.
        </p>
      </div>

      <Link href="/accueil" className="mt-6 text-center text-sm font-medium text-charbon-400 underline">
        Pas maintenant
      </Link>
    </div>
  );
}
