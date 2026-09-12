import type { NiveauActivite } from "@assiettly/shared";
import { CarteChoix } from "../primitives/CarteChoix";
import type { EtapeProps } from "../types";

const OPTIONS: { value: NiveauActivite; icone: string; label: string; description: string }[] = [
  { value: "SEDENTAIRE", icone: "🪑", label: "Peu actif", description: "Peu ou pas de sport, journée plutôt assise" },
  { value: "MODERE", icone: "🚶", label: "Modérément actif", description: "Sport 2 à 4 fois par semaine" },
  { value: "TRES_ACTIF", icone: "🏃", label: "Très actif", description: "Sport intense ou quotidien" },
];

export function EtapeActivite({ profil, majProfil }: EtapeProps) {
  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">Ton niveau d&rsquo;activité ?</h1>
      <p className="mb-6 text-charbon-400">Ça ajuste tes besoins caloriques au quotidien.</p>
      <div className="space-y-3">
        {OPTIONS.map((o) => (
          <CarteChoix
            key={o.value}
            icone={o.icone}
            label={o.label}
            description={o.description}
            selectionnee={profil.niveauActivite === o.value}
            onClick={() => majProfil("niveauActivite", o.value)}
          />
        ))}
      </div>
    </div>
  );
}
