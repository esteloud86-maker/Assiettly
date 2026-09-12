interface ChoixOuiNonProps {
  valeur: boolean | null;
  onChange: (v: boolean) => void;
}

/** Choix binaire Oui/Non, deux cartes côte à côte avec icônes pouce. */
export function ChoixOuiNon({ valeur, onChange }: ChoixOuiNonProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => onChange(true)}
        className={`flex flex-col items-center gap-2 rounded-2xl border p-6 transition-colors ${
          valeur === true ? "border-corail-500 bg-corail-50" : "border-creme-200 bg-creme-50 hover:border-corail-400"
        }`}
      >
        <span className="text-3xl">👍</span>
        <span className="font-titre font-semibold text-charbon-800">Oui</span>
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex flex-col items-center gap-2 rounded-2xl border p-6 transition-colors ${
          valeur === false ? "border-corail-500 bg-corail-50" : "border-creme-200 bg-creme-50 hover:border-corail-400"
        }`}
      >
        <span className="text-3xl">👎</span>
        <span className="font-titre font-semibold text-charbon-800">Non</span>
      </button>
    </div>
  );
}
