const EMPLACEMENTS = 3;

/**
 * Emplacement "livre d'or" prêt à accueillir de vrais avis — masqué en
 * production tant qu'on n'a aucun avis réel à y mettre (même règle
 * d'honnêteté que le reste de la landing : jamais d'avis ou de note
 * inventés). Visible en dev uniquement, pour construire la mise en page à
 * l'avance.
 */
export function LivreOr() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-chalk text-sm font-semibold text-corail-700">
        [DEV UNIQUEMENT — masqué en production tant qu'il n'y a aucun vrai avis]
      </p>
      <h2 className="mt-1 font-titre text-3xl font-bold text-charbon-800">Le livre d'or</h2>
      <p className="mt-2 max-w-md text-charbon-600">Emplacement prêt pour de vrais avis, dès qu'on en a.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: EMPLACEMENTS }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-dashed border-charbon-400/30 p-5 text-sm text-charbon-400"
          >
            Avis à venir
          </div>
        ))}
      </div>
    </section>
  );
}
