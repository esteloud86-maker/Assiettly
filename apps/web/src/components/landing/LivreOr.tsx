import { obtenirAvisAffiches } from "@/lib/avis";

/**
 * "Livre d'or" — sobre, filets fins comme le reste de la carte (cf. FAQ,
 * Tarifs). Rien d'inventé : pas de note moyenne, pas de nombre
 * d'utilisateurs, seulement ce que chaque avis contient réellement
 * (prénom, texte, date, note si la personne en a laissé une).
 *
 * `obtenirAvisAffiches()` renvoie un tableau vide tant qu'il y a moins de 3
 * avis valides (consentement explicite) — dans ce cas la section ne rend
 * strictement rien : pas de titre, pas d'espace vide, pas d'ancre pour la
 * nav (cf. HeaderLanding.tsx/MenuMobile.tsx, qui reçoivent `avisVisibles`
 * en prop depuis la même fonction pour ne jamais afficher un lien mort).
 */
export function LivreOr() {
  const avis = obtenirAvisAffiches();
  if (avis.length === 0) return null;

  return (
    <section id="avis" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-chalk text-sm font-semibold text-sarcelle-600">Le livre d&apos;or</p>
      <h2 className="mt-1 font-titre text-3xl font-bold text-charbon-800">Ce qu&apos;on nous dit</h2>

      <div className="mt-8 divide-y divide-charbon-400/15 border-y border-charbon-400/15">
        {avis.map((a) => (
          <div key={a.id} className="py-5">
            {a.note ? (
              <p aria-label={`Note : ${a.note} sur 5`} className="text-sm tracking-wide">
                <span className="text-ambre-700">{"★".repeat(a.note)}</span>
                <span aria-hidden="true" className="text-charbon-400/40">
                  {"★".repeat(5 - a.note)}
                </span>
              </p>
            ) : null}
            <p className={`text-charbon-800 ${a.note ? "mt-2" : ""}`}>&laquo;&nbsp;{a.texte}&nbsp;&raquo;</p>
            <p className="mt-2 text-sm text-charbon-400">
              {a.prenom} ·{" "}
              {new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
