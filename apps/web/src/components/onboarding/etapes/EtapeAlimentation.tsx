import type { TypeAlimentation } from "@assiettly/shared";
import { CarteChoix } from "../primitives/CarteChoix";
import type { EtapeProps } from "../types";

const OPTIONS: { value: TypeAlimentation; icone: string; label: string }[] = [
  { value: "EQUILIBRE", icone: "🍽️", label: "Équilibré, sans restriction" },
  { value: "VEGETARIEN", icone: "🥕", label: "Végétarien" },
  { value: "VEGAN", icone: "🌱", label: "Végan" },
  { value: "PESCETARIEN", icone: "🐟", label: "Pescétarien" },
  { value: "FLEXITARIEN", icone: "🥗", label: "Flexitarien" },
];

export function EtapeAlimentation({ profil, majProfil }: EtapeProps) {
  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">Ton type d&rsquo;alimentation ?</h1>
      <p className="mb-6 text-charbon-400">Pour te proposer des aliments qui te correspondent.</p>
      <div className="space-y-3">
        {OPTIONS.map((o) => (
          <CarteChoix
            key={o.value}
            icone={o.icone}
            label={o.label}
            selectionnee={profil.typeAlimentation === o.value}
            onClick={() => majProfil("typeAlimentation", o.value)}
          />
        ))}
      </div>
    </div>
  );
}
