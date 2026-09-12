/**
 * Marque "flamme" propre à Assiettly : forme arrondie en dégradé ambre → corail,
 * dessinée pour la marque plutôt que reprise d'un émoji ou d'une icône tierce.
 */
export function FlammeIcon({ className, eteinte = false }: { className?: string; eteinte?: boolean }) {
  const id = eteinte ? "flamme-eteinte" : "flamme-allumee";
  return (
    <svg viewBox="0 0 24 28" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="12" y1="2" x2="12" y2="27" gradientUnits="userSpaceOnUse">
          {eteinte ? (
            <>
              <stop stopColor="#D8D2CC" />
              <stop offset="1" stopColor="#B7AFA7" />
            </>
          ) : (
            <>
              <stop stopColor="#FFCB7A" />
              <stop offset="0.55" stopColor="#F2953C" />
              <stop offset="1" stopColor="#F2603C" />
            </>
          )}
        </linearGradient>
      </defs>
      <path
        d="M12.4 2C12.4 2 6.8 8.4 6.8 14.3C6.8 18.6 9.3 22.4 13.3 22.4C17.7 22.4 20.4 18.9 20.4 14.9C20.4 11.7 18.7 9.6 18.7 9.6C18.7 9.6 18.9 12.3 17.3 13.3C17.6 10.5 15.6 6.4 12.4 2Z"
        fill={`url(#${id})`}
      />
      <path
        d="M12.9 16C12.9 16 10.9 17.8 10.9 20C10.9 22 12.2 23.4 13.9 23.4C15.7 23.4 17 21.9 17 20C17 18.3 15.7 17 15.7 17C15.7 17 15.8 18.1 15.1 18.5C15.1 16.9 14.3 15.3 12.9 16Z"
        fill={eteinte ? "#EDE8E2" : "#FFE3B0"}
        opacity="0.9"
      />
    </svg>
  );
}
