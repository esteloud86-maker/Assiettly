export function PaginationPoints({
  total,
  actif,
  onChange,
}: {
  total: number;
  actif: number;
  onChange?: (index: number) => void;
}) {
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-center">
      {Array.from({ length: total }, (_, i) => (
        // Le point visuel reste petit, mais le bouton garde une zone
        // tactile de 44x44px (recommandation Apple/Android) grâce au
        // flex centré plutôt qu'à la taille du point lui-même.
        <button
          key={i}
          type="button"
          aria-label={`Page ${i + 1}`}
          onClick={() => onChange?.(i)}
          className="flex h-11 w-8 items-center justify-center"
        >
          <span className={`h-1.5 rounded-full transition-all ${i === actif ? "w-4 bg-corail-500" : "w-1.5 bg-creme-200"}`} />
        </button>
      ))}
    </div>
  );
}
