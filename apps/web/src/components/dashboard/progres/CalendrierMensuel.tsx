import { obtenirCalendrierStreak } from "@/server/actions/streaks";

const JOURS_SEMAINE = ["L", "M", "M", "J", "V", "S", "D"];
const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export async function CalendrierMensuel() {
  const maintenant = new Date();
  const annee = maintenant.getUTCFullYear();
  const mois = maintenant.getUTCMonth();

  const debut = new Date(Date.UTC(annee, mois, 1));
  const fin = new Date(Date.UTC(annee, mois + 1, 0));
  const jours = await obtenirCalendrierStreak(debut.toISOString().slice(0, 10), fin.toISOString().slice(0, 10));

  const parDate = new Map(jours.map((j) => [j.date.toISOString().slice(0, 10), j]));
  const nbJoursMois = fin.getUTCDate();
  const decalageDebut = (debut.getUTCDay() + 6) % 7;

  const cases: (null | { date: string; flamme: boolean; freeze: boolean; estAujourdHui: boolean })[] = [
    ...Array.from({ length: decalageDebut }, () => null),
    ...Array.from({ length: nbJoursMois }, (_, i) => {
      const date = new Date(Date.UTC(annee, mois, i + 1)).toISOString().slice(0, 10);
      const jour = parDate.get(date);
      return {
        date,
        flamme: jour?.flammeAllumee ?? false,
        freeze: jour?.freezeUtilise ?? false,
        estAujourdHui: date === maintenant.toISOString().slice(0, 10),
      };
    }),
  ];

  return (
    <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
      <h2 className="mb-4 font-titre font-semibold text-charbon-800">
        Calendrier de {MOIS[mois]} {annee}
      </h2>
      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-charbon-400">
        {JOURS_SEMAINE.map((j, i) => (
          <span key={i}>{j}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cases.map((c, i) =>
          c === null ? (
            <div key={i} />
          ) : (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-full text-sm font-medium ${
                c.flamme
                  ? "bg-corail-500 text-white"
                  : c.freeze
                    ? "bg-sarcelle-100 text-sarcelle-600"
                    : "bg-creme-200 text-charbon-400"
              } ${c.estAujourdHui ? "ring-2 ring-ambre-500" : ""}`}
              title={c.date}
            >
              {Number(c.date.slice(-2))}
            </div>
          ),
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-charbon-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-corail-500" /> Flamme
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-sarcelle-100" /> Freeze
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-creme-200" /> Manqué
        </span>
      </div>
    </div>
  );
}
