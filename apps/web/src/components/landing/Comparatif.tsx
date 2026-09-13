/**
 * Tableau comparatif "Assiettly vs apps génériques de suivi calorique" — sans
 * nommer de concurrent précis, et chaque ligne limitée à ce qui est vrai et
 * vérifiable côté Assiettly (hébergement UE confirmé sur le projet Supabase
 * en eu-west-3, base alimentaire et interface construites pour la France dès
 * le départ, mécanique de flamme réellement implémentée). Les colonnes
 * "apps généralistes" restent volontairement nuancées ("partiel", "variable")
 * plutôt que des ❌ catégoriques : la publicité comparative en France doit
 * être exacte, vérifiable et non trompeuse (Code de la consommation) — à
 * faire relire avant lancement public si de nouvelles lignes sont ajoutées.
 */
const LIGNES = [
  {
    critere: "Base alimentaire adaptée à la cuisine française",
    assiettly: "✅ Oui",
    generaliste: "Souvent partielle",
  },
  {
    critere: "Motivation par streak quotidien (flamme)",
    assiettly: "✅ Oui",
    generaliste: "Variable selon l'app",
  },
  {
    critere: "Interface et parcours 100 % en français",
    assiettly: "✅ Oui",
    generaliste: "Souvent traduite, pas toujours pensée pour la France",
  },
  {
    critere: "Hébergement des données en Europe",
    assiettly: "✅ Oui",
    generaliste: "À vérifier selon l'app",
  },
];

export function Comparatif() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-titre text-3xl font-bold text-charbon-800">Ce qui change avec Assiettly</h2>
      <p className="mt-2 text-center text-charbon-400">
        Comparé aux applications de suivi calorique généralistes.
      </p>

      {/* Mobile : cartes empilées, tiennent sans défilement horizontal. */}
      <div className="mt-8 space-y-3 sm:hidden">
        {LIGNES.map((ligne) => (
          <div key={ligne.critere} className="rounded-2xl bg-creme-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-charbon-800">{ligne.critere}</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-corail-50 p-2.5">
                <p className="font-titre text-xs font-semibold text-corail-600">Assiettly</p>
                <p className="mt-1 text-sm font-medium text-sarcelle-600">{ligne.assiettly}</p>
              </div>
              <div className="rounded-xl bg-creme-100 p-2.5">
                <p className="font-titre text-xs font-semibold text-charbon-400">Généralistes</p>
                <p className="mt-1 text-sm text-charbon-400">{ligne.generaliste}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tablette et plus : tableau classique. */}
      <div className="mt-8 hidden overflow-hidden rounded-2xl bg-creme-50 shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-creme-200">
              <th className="p-4 font-titre font-semibold text-charbon-800">Critère</th>
              <th className="p-4 font-titre font-semibold text-corail-600">Assiettly</th>
              <th className="p-4 font-titre font-semibold text-charbon-400">Applications généralistes</th>
            </tr>
          </thead>
          <tbody>
            {LIGNES.map((ligne) => (
              <tr key={ligne.critere} className="border-b border-creme-200 last:border-0">
                <td className="p-4 text-charbon-800">{ligne.critere}</td>
                <td className="p-4 font-medium text-sarcelle-600">{ligne.assiettly}</td>
                <td className="p-4 text-charbon-400">{ligne.generaliste}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-center text-xs text-charbon-400">
        Comparaison générale basée sur les fonctionnalités publiques habituelles des applications de suivi
        calorique, sans viser une application en particulier.
      </p>
    </section>
  );
}
