import type { MotivationPrincipale } from "@assiettly/shared";
import { CarteChoix } from "../primitives/CarteChoix";
import type { EtapeProps } from "../types";

const OPTIONS: { value: MotivationPrincipale; icone: string; label: string }[] = [
  { value: "MIEUX_MANGER", icone: "🥦", label: "Mieux manger et me sentir bien" },
  { value: "PLUS_ENERGIE", icone: "⚡", label: "Avoir plus d&rsquo;énergie au quotidien" },
  { value: "RESTER_MOTIVE", icone: "🔥", label: "Rester motivé·e sur la durée" },
  { value: "BIEN_DANS_SON_CORPS", icone: "💛", label: "Me sentir bien dans mon corps" },
];

export function EtapeMotivation({ profil, majProfil }: EtapeProps) {
  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">Ta motivation principale ?</h1>
      <p className="mb-6 text-charbon-400">On s&rsquo;en sert pour adapter tes encouragements.</p>
      <div className="space-y-3">
        {OPTIONS.map((o) => (
          <CarteChoix
            key={o.value}
            icone={o.icone}
            label={o.label}
            selectionnee={profil.motivationPrincipale === o.value}
            onClick={() => majProfil("motivationPrincipale", o.value)}
          />
        ))}
      </div>
    </div>
  );
}
