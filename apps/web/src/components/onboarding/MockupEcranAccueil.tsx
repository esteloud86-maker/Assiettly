/**
 * Mockup d'un écran d'accueil de téléphone avec l'icône Assiettly, en
 * SVG/CSS pur (même logique que le mockup du dashboard sur la landing) :
 * zéro image à charger, rendu instantané, cohérent avec la marque.
 */
export function MockupEcranAccueil() {
  const AUTRES_ICONES = ["#8FB8C9", "#C9A98F", "#A98FC9", "#8FC9A0", "#C98F9D"];

  return (
    <div className="mx-auto w-full max-w-[220px] rounded-[2.5rem] border-[6px] border-charbon-800 bg-gradient-to-b from-corail-100 to-sarcelle-50 p-4 shadow-xl">
      <div className="mx-auto mb-4 h-4 w-20 rounded-full bg-charbon-800/80" />
      <div className="grid grid-cols-4 gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-creme-50 shadow-md ring-2 ring-corail-500">
            <svg viewBox="0 0 24 28" className="h-6 w-6" fill="none">
              <defs>
                <linearGradient id="mockup-flamme" x1="12" y1="2" x2="12" y2="27" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFCB7A" />
                  <stop offset="0.55" stopColor="#F2953C" />
                  <stop offset="1" stopColor="#F2603C" />
                </linearGradient>
              </defs>
              <path
                d="M12.4 2C12.4 2 6.8 8.4 6.8 14.3C6.8 18.6 9.3 22.4 13.3 22.4C17.7 22.4 20.4 18.9 20.4 14.9C20.4 11.7 18.7 9.6 18.7 9.6C18.7 9.6 18.9 12.3 17.3 13.3C17.6 10.5 15.6 6.4 12.4 2Z"
                fill="url(#mockup-flamme)"
              />
            </svg>
          </div>
          <span className="text-[9px] font-medium text-charbon-800">Assiettly</span>
        </div>
        {AUTRES_ICONES.map((couleur, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-11 w-11 rounded-2xl opacity-60" style={{ backgroundColor: couleur }} />
            <div className="h-1 w-6 rounded-full bg-charbon-800/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
