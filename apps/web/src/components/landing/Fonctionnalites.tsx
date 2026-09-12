const FONCTIONNALITES = [
  {
    icone: "📷",
    titre: "Scan de repas par photo",
    description: "Prends ton assiette en photo, Assiettly estime calories et macros en quelques secondes.",
  },
  {
    icone: "🔥",
    titre: "La flamme qui motive",
    description: "Un streak quotidien pensé pour tenir dans la durée, pas pour culpabiliser au moindre écart.",
  },
  {
    icone: "🇫🇷",
    titre: "Pensé pour la cuisine française",
    description: "Une base alimentaire construite autour des plats du quotidien, pas des équivalents anglo-saxons.",
  },
  {
    icone: "⚖️",
    titre: "Suivi de poids et de progrès",
    description: "Une courbe claire de ton évolution, avec des messages qui encouragent plutôt qu'ils ne jugent.",
  },
];

export function Fonctionnalites() {
  return (
    <section id="fonctionnalites" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center font-titre text-3xl font-bold text-charbon-800">Tout ce qu'il te faut au quotidien</h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FONCTIONNALITES.map((f) => (
          <div key={f.titre} className="rounded-2xl bg-creme-50 p-6 shadow-sm">
            <span className="text-3xl">{f.icone}</span>
            <h3 className="mt-3 font-titre font-semibold text-charbon-800">{f.titre}</h3>
            <p className="mt-1.5 text-sm text-charbon-600">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
