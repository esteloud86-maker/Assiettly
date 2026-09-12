interface CarteChoixProps {
  icone: string;
  label: string;
  description?: string;
  selectionnee: boolean;
  onClick: () => void;
  compact?: boolean;
}

/** Carte sélectionnable générique (icône + libellé + description optionnelle). */
export function CarteChoix({ icone, label, description, selectionnee, onClick, compact }: CarteChoixProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
        selectionnee ? "border-corail-500 bg-corail-50" : "border-creme-200 bg-creme-50 hover:border-corail-400"
      }`}
    >
      <span className="text-2xl">{icone}</span>
      <span className="flex-1">
        <span className={`block font-titre font-semibold text-charbon-800 ${compact ? "text-sm" : ""}`}>
          {label}
        </span>
        {description ? <span className="mt-0.5 block text-sm text-charbon-400">{description}</span> : null}
      </span>
      <span
        className={`h-5 w-5 shrink-0 rounded-full border-2 ${
          selectionnee ? "border-corail-500 bg-corail-500" : "border-creme-200"
        }`}
      />
    </button>
  );
}
