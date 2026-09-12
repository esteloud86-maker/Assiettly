/**
 * Mockup du dashboard pour le hero — en SVG/CSS pur plutôt qu'une image
 * (aucun poids réseau, dimensions explicites, zéro décalage de mise en page
 * au chargement, cohérent avec les composants réels de l'app).
 */
export function MockupDashboard() {
  const rayon = 46;
  const circonference = 2 * Math.PI * rayon;
  const pct = 0.62;

  return (
    <div className="w-full max-w-sm rounded-3xl bg-creme-50 p-5 shadow-xl shadow-charbon-800/10">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-titre font-semibold text-charbon-800">Assiettly</span>
        <div className="flex items-center gap-1.5 rounded-full bg-creme-200 px-3 py-1">
          <svg viewBox="0 0 24 28" className="h-4 w-4" fill="none">
            <defs>
              <linearGradient id="flamme-hero" x1="12" y1="2" x2="12" y2="27" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFCB7A" />
                <stop offset="0.55" stopColor="#F2953C" />
                <stop offset="1" stopColor="#F2603C" />
              </linearGradient>
            </defs>
            <path
              d="M12.4 2C12.4 2 6.8 8.4 6.8 14.3C6.8 18.6 9.3 22.4 13.3 22.4C17.7 22.4 20.4 18.9 20.4 14.9C20.4 11.7 18.7 9.6 18.7 9.6C18.7 9.6 18.9 12.3 17.3 13.3C17.6 10.5 15.6 6.4 12.4 2Z"
              fill="url(#flamme-hero)"
            />
          </svg>
          <span className="font-titre text-sm font-semibold text-charbon-800">12</span>
        </div>
      </div>

      <div className="flex flex-col items-center rounded-2xl bg-creme-100 p-5">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={rayon} strokeWidth="12" className="stroke-creme-200" fill="none" />
            <circle
              cx="60"
              cy="60"
              r={rayon}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              stroke="url(#degrade-hero)"
              strokeDasharray={circonference}
              strokeDashoffset={circonference * (1 - pct)}
            />
            <defs>
              <linearGradient id="degrade-hero" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F2603C" />
                <stop offset="100%" stopColor="#F2953C" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-titre text-2xl font-bold text-charbon-800">1120</span>
            <span className="text-xs text-charbon-400">/ 1800 kcal</span>
          </div>
        </div>

        <div className="mt-4 grid w-full grid-cols-3 gap-2">
          {[
            { label: "Prot.", pct: 58, couleur: "bg-corail-500" },
            { label: "Gluc.", pct: 44, couleur: "bg-sarcelle-500" },
            { label: "Lip.", pct: 30, couleur: "bg-ambre-500" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-creme-50 p-2 text-center">
              <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-creme-200">
                <div className={`h-full rounded-full ${m.couleur}`} style={{ width: `${m.pct}%` }} />
              </div>
              <span className="text-[10px] font-medium text-charbon-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
