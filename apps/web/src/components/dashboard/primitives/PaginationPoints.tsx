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
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Page ${i + 1}`}
          onClick={() => onChange?.(i)}
          className={`h-1.5 rounded-full transition-all ${
            i === actif ? "w-4 bg-corail-500" : "w-1.5 bg-creme-200"
          }`}
        />
      ))}
    </div>
  );
}
