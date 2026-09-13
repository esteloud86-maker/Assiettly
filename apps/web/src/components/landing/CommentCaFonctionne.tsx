const ETAPES = [
  {
    icone: "📷",
    titre: "Prends ton repas en photo",
    description: "Directement depuis l'app, sans jongler entre plusieurs écrans.",
  },
  {
    icone: "🧠",
    titre: "L'IA identifie et calcule",
    description: "Aliments, quantités, calories et macros estimés en quelques secondes.",
  },
  {
    icone: "🔥",
    titre: "Ta flamme avance",
    description: "Chaque jour où tu restes dans tes objectifs fait grandir ton streak, sans culpabiliser au moindre écart.",
  },
  {
    icone: "📈",
    titre: "Tu suis ta progression",
    description: "Poids, tendances et calories moyennes dans le temps, en un coup d'œil.",
  },
];

export function CommentCaFonctionne() {
  return (
    <section id="comment-ca-marche" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-titre text-3xl font-bold text-charbon-800">Comment ça fonctionne</h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {ETAPES.map((etape, i) => (
          <div key={etape.titre} className="relative text-center sm:text-left">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-corail-50 text-2xl sm:mx-0">
              {etape.icone}
            </div>
            <span className="mt-3 block font-titre text-sm font-semibold text-corail-500">Étape {i + 1}</span>
            <h3 className="mt-1 font-titre font-semibold text-charbon-800">{etape.titre}</h3>
            <p className="mt-1.5 text-sm text-charbon-600">{etape.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
