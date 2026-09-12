/**
 * Section de réassurance sur la landing. Tant qu'on n'a pas de vrais chiffres
 * (nombre d'utilisateurs, note moyenne) ou de vrais témoignages, on ne
 * fabrique rien — un chiffre inventé "à remplacer plus tard" finit presque
 * toujours par rester en prod, avec un vrai risque de confiance et de
 * conformité (publicité mensongère) une fois l'app lancée publiquement.
 *
 * Pour activer la vraie version une fois les données disponibles :
 * 1. Passer `AFFICHER_CHIFFRES_REELS` à `true`
 * 2. Remplir `STATS` et/ou `TEMOIGNAGES` ci-dessous
 * Le même gabarit visuel (`CarteReassurance`) est réutilisé dans les deux
 * cas, donc rien à redessiner.
 */
const AFFICHER_CHIFFRES_REELS = false;

const STATS: { valeur: string; label: string }[] = [];
const TEMOIGNAGES: { nom: string; texte: string }[] = [];

const REASSURANCES_FACTUELLES = [
  {
    icone: "🇪🇺",
    titre: "Données hébergées en Europe",
    description: "Conforme RGPD, hébergement des données en UE — pas d'exportation vers des serveurs hors Europe.",
  },
  {
    icone: "🇫🇷",
    titre: "Construit pour la cuisine française",
    description: "Une base alimentaire pensée dès le départ pour les plats et marques du quotidien en France.",
  },
];

export function SocialProof() {
  if (AFFICHER_CHIFFRES_REELS && (STATS.length > 0 || TEMOIGNAGES.length > 0)) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {STATS.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-3">
            {STATS.map((s) => (
              <CarteReassurance key={s.label} titre={s.valeur} description={s.label} />
            ))}
          </div>
        ) : null}
        {TEMOIGNAGES.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {TEMOIGNAGES.map((t) => (
              <div key={t.nom} className="rounded-2xl bg-creme-50 p-6 shadow-sm">
                <p className="text-charbon-600">&ldquo;{t.texte}&rdquo;</p>
                <p className="mt-3 font-titre font-semibold text-charbon-800">{t.nom}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {REASSURANCES_FACTUELLES.map((r) => (
          <CarteReassurance key={r.titre} icone={r.icone} titre={r.titre} description={r.description} />
        ))}
      </div>
    </section>
  );
}

function CarteReassurance({ icone, titre, description }: { icone?: string; titre: string; description: string }) {
  return (
    <div className="rounded-2xl bg-sarcelle-50 p-6 text-center sm:text-left">
      {icone ? <span className="text-2xl">{icone}</span> : null}
      <h3 className="mt-2 font-titre font-semibold text-sarcelle-600">{titre}</h3>
      <p className="mt-1 text-sm text-charbon-600">{description}</p>
    </div>
  );
}
