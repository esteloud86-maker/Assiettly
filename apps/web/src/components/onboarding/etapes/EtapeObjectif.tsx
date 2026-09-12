import type { ObjectifType } from "@assiettly/shared";
import { CarteChoix } from "../primitives/CarteChoix";
import type { EtapeProps } from "../types";

const OPTIONS: { value: ObjectifType; icone: string; label: string; description: string }[] = [
  { value: "PERTE", icone: "📉", label: "Perdre du poids", description: "Un déficit calorique modéré et durable" },
  { value: "MAINTIEN", icone: "➖", label: "Maintenir mon poids", description: "Garder l&rsquo;équilibre actuel" },
  { value: "PRISE_MASSE", icone: "📈", label: "Prendre du poids", description: "Un léger surplus calorique" },
];

export function EtapeObjectif({ profil, majProfil }: EtapeProps) {
  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">Quel est ton objectif principal ?</h1>
      <p className="mb-6 text-charbon-400">On adapte tout le reste autour de ça.</p>
      <div className="space-y-3">
        {OPTIONS.map((o) => (
          <CarteChoix
            key={o.value}
            icone={o.icone}
            label={o.label}
            description={o.description}
            selectionnee={profil.objectifType === o.value}
            onClick={() => majProfil("objectifType", o.value)}
          />
        ))}
      </div>
    </div>
  );
}
