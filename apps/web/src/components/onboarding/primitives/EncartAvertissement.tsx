export function EncartAvertissement({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-creme-100 p-4">
      <span className="text-xl">⚠️</span>
      <p className="text-sm leading-relaxed text-charbon-600">{children}</p>
    </div>
  );
}
