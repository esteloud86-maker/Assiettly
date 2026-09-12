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
      <p className="mt-2 text-center text-charbon-400">Comparé aux apps de suivi calorique généralistes.</p>

      <div className="mt-10 overflow-x-auto rounded-2xl bg-creme-50 shadow-sm">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-creme-200">
              <th className="p-4 font-titre font-semibold text-charbon-800">Critère</th>
              <th className="p-4 font-titre font-semibold text-corail-600">Assiettly</th>
              <th className="p-4 font-titre font-semibold text-charbon-400">Apps généralistes</th>
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
