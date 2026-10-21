const ETAPES = [
  {
    titre: "Prends ton repas en photo",
    description: "Directement depuis l'app, sans jongler entre plusieurs écrans.",
  },
  {
    titre: "L'IA identifie et calcule",
    description: "Aliments, quantités, calories et macros estimés en quelques secondes.",
  },
  {
    titre: "Ta flamme avance",
    description: "Chaque jour où tu restes dans tes objectifs fait grandir ton streak, sans culpabiliser au moindre écart.",
  },
  {
    titre: "Tu suis ta progression",
    description: "Poids, tendances et calories moyennes dans le temps, en un coup d'œil.",
  },
];

/**
 * Présentée comme une vraie séquence de menu (les temps d'un repas), pas
 * une grille 2x2 de cartes identiques : une colonne, alignée à gauche,
 * filets fins entre chaque temps plutôt que des icônes en cercle.
 */
export function CommentCaFonctionne() {
  return (
    <section id="comment-ca-marche" className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <p className="font-chalk text-sm font-semibold text-corail-700">Le déroulé</p>
      <h2 className="mt-1 font-titre text-3xl font-bold text-charbon-800">Comment ça fonctionne</h2>

      <ol className="mt-8 divide-y divide-charbon-400/15 border-y border-charbon-400/15">
        {ETAPES.map((etape, i) => (
          <li key={etape.titre} className="flex gap-4 py-5">
            <span className="font-titre text-lg font-semibold tabular-nums text-corail-700">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-titre font-semibold text-charbon-800">{etape.titre}</h3>
              <p className="mt-1 text-sm text-charbon-600">{etape.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
