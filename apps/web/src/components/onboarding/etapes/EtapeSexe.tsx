import type { Sexe } from "@assiettly/shared";
import { CarteChoix } from "../primitives/CarteChoix";
import type { EtapeProps } from "../types";

const OPTIONS: { value: Sexe; icone: string; label: string }[] = [
  { value: "FEMME", icone: "👩", label: "Une femme" },
  { value: "HOMME", icone: "👨", label: "Un homme" },
  { value: "AUTRE", icone: "🧑", label: "Autre" },
];

export function EtapeSexe({ profil, majProfil }: EtapeProps) {
  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">Tu es...</h1>
      <p className="mb-6 text-charbon-400">Ça nous aide à affiner le calcul de tes besoins.</p>
      <div className="space-y-3">
        {OPTIONS.map((o) => (
          <CarteChoix
            key={o.value}
            icone={o.icone}
            label={o.label}
            selectionnee={profil.sexe === o.value}
            onClick={() => majProfil("sexe", o.value)}
          />
        ))}
      </div>
    </div>
  );
}
