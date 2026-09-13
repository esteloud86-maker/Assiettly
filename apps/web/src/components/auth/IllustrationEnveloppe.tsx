/** Enveloppe stylisée dans l'identité Assiettly — remplace l'emoji système par un visuel cohérent sur tous les appareils. */
export function IllustrationEnveloppe() {
  return (
    <svg viewBox="0 0 120 96" className="mx-auto h-24 w-28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="enveloppe-corps" x1="0" y1="0" x2="0" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFDCD0" />
          <stop offset="1" stopColor="#FFCB7A" />
        </linearGradient>
        <linearGradient id="enveloppe-rabat" x1="0" y1="0" x2="120" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F2953C" />
          <stop offset="1" stopColor="#F2603C" />
        </linearGradient>
      </defs>
      <rect x="4" y="20" width="112" height="72" rx="12" fill="url(#enveloppe-corps)" />
      <path d="M4 32 60 68 116 32" stroke="url(#enveloppe-rabat)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="96" cy="16" r="16" fill="#1F7A6C" />
      <path d="M89 16.5 94 21.5 103.5 11" stroke="#FBF4EC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
