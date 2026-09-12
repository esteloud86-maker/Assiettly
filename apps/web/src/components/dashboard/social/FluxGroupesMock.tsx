const MEMBRES_DEMO = [
  { nom: "Membre A", streak: 12, couronne: true },
  { nom: "Membre B", streak: 8, couronne: false },
  { nom: "Membre C", streak: 5, couronne: false },
  { nom: "Toi", streak: 3, couronne: false },
];

const POSTS_DEMO = [
  {
    auteur: "Membre A",
    horodatage: "il y a 2 h",
    description: "Bowl de saison, simple et efficace 🥗",
    calories: 520,
    proteinesG: 32,
    glucidesG: 48,
    lipidesG: 18,
    reactions: 4,
    commentaires: 1,
  },
  {
    auteur: "Membre B",
    horodatage: "il y a 5 h",
    description: "Petit-déj protéiné avant le sport",
    calories: 380,
    proteinesG: 28,
    glucidesG: 34,
    lipidesG: 12,
    reactions: 2,
    commentaires: 0,
  },
];

/**
 * Aperçu du flux social (V2) : architecture prévue (sélecteur de groupe,
 * classement par streak, fil de posts) mais fonctionnalité désactivée et
 * alimentée de données de démonstration en attendant la vraie implémentation
 * (création de groupes, invitations, réactions persistées...).
 */
export function FluxGroupesMock() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-ambre-300/30 p-3 text-center text-sm font-medium text-charbon-600">
        Aperçu de la fonctionnalité Groupes — arrive dans une prochaine mise à jour ✨
      </div>

      <button
        disabled
        className="flex w-full items-center justify-between rounded-2xl bg-creme-50 p-4 opacity-60 shadow-sm"
      >
        <span className="font-titre font-semibold text-charbon-800">👥 Les motivés du lundi</span>
        <span className="text-charbon-400">▾</span>
      </button>

      <div className="flex justify-between overflow-x-auto rounded-2xl bg-creme-50 p-4 shadow-sm">
        {MEMBRES_DEMO.map((membre) => (
          <div key={membre.nom} className="flex flex-col items-center gap-1 px-2">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-creme-200 text-xl">
              🙂
              {membre.couronne ? <span className="absolute -top-3 text-sm">👑</span> : null}
            </div>
            <span className="text-xs font-medium text-charbon-800">{membre.nom}</span>
            <span className="text-xs text-corail-600">🔥 {membre.streak}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {POSTS_DEMO.map((post, i) => (
          <div key={i} className="space-y-3 rounded-2xl bg-creme-50 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-creme-200">🙂</span>
              <div>
                <p className="text-sm font-semibold text-charbon-800">{post.auteur}</p>
                <p className="text-xs text-charbon-400">{post.horodatage}</p>
              </div>
            </div>
            <p className="text-sm text-charbon-800">{post.description}</p>
            <div className="flex h-32 items-center justify-center rounded-xl bg-creme-200 text-3xl">🍽️</div>
            <p className="text-xs text-charbon-400">
              {post.calories} kcal · {post.proteinesG}g P · {post.glucidesG}g G · {post.lipidesG}g L
            </p>
            <div className="flex gap-4 border-t border-creme-200 pt-2 text-sm text-charbon-400">
              <button disabled className="opacity-60">
                🔥 Réagir ({post.reactions})
              </button>
              <button disabled className="opacity-60">
                💬 Commenter ({post.commentaires})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
