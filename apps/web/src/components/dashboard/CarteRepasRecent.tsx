import Link from "next/link";

const LIBELLES_TYPE: Record<string, string> = {
  PETIT_DEJ: "Petit-déjeuner",
  DEJEUNER: "Déjeuner",
  DINER: "Dîner",
  COLLATION: "Collation",
};

interface RepasRecentProps {
  id: string;
  type: string;
  createdAt: Date;
  totaux: { caloriesKcal: number; proteinesG: number; glucidesG: number; lipidesG: number };
  nomPrincipal: string;
}

export function CarteRepasRecent({ repas }: { repas: RepasRecentProps }) {
  const heure = repas.createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      href={`/repas/${repas.id}`}
      className="flex items-center gap-3 rounded-2xl bg-creme-50 p-3 shadow-sm transition-colors hover:bg-creme-200"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-creme-200 text-2xl">
        🍽️
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-charbon-800">{repas.nomPrincipal}</p>
        <p className="text-xs text-charbon-400">
          {LIBELLES_TYPE[repas.type] ?? repas.type} · {heure}
        </p>
        <p className="mt-0.5 text-xs text-charbon-400">
          {Math.round(repas.totaux.proteinesG)}g P · {Math.round(repas.totaux.glucidesG)}g G ·{" "}
          {Math.round(repas.totaux.lipidesG)}g L
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-titre font-semibold text-charbon-800">{Math.round(repas.totaux.caloriesKcal)}</p>
        <p className="text-xs text-charbon-400">kcal</p>
      </div>
    </Link>
  );
}
