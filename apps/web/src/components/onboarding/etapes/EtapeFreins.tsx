import type { Frein } from "@assiettly/shared";
import { CarteChoix } from "../primitives/CarteChoix";
import type { EtapeProps } from "../types";

const OPTIONS: { value: Frein; icone: string; label: string }[] = [
  { value: "MANQUE_REGULARITE", icone: "🔄", label: "Manquer de régularité" },
  { value: "MANQUE_TEMPS", icone: "⏰", label: "Manquer de temps" },
  { value: "MANQUE_INSPIRATION", icone: "🍽️", label: "Manquer d&rsquo;idées de repas" },
  { value: "ENVIES_SUCREES", icone: "🍩", label: "Craquer sur le sucré" },
  { value: "REPAS_SOCIAUX", icone: "🥂", label: "Les repas entre amis/famille" },
  { value: "MANQUE_SOUTIEN", icone: "🤝", label: "Manquer de soutien/motivation" },
];

export function EtapeFreins({ profil, majProfil }: EtapeProps) {
  function basculer(valeur: Frein) {
    const dejaCoche = profil.freins.includes(valeur);
    majProfil("freins", dejaCoche ? profil.freins.filter((f) => f !== valeur) : [...profil.freins, valeur]);
  }

  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">Qu&rsquo;est-ce qui te freine d&rsquo;habitude ?</h1>
      <p className="mb-6 text-charbon-400">Choisis tout ce qui te parle — ça reste entre nous.</p>
      <div className="space-y-3">
        {OPTIONS.map((o) => (
          <CarteChoix
            key={o.value}
            icone={o.icone}
            label={o.label}
            selectionnee={profil.freins.includes(o.value)}
            onClick={() => basculer(o.value)}
          />
        ))}
      </div>
    </div>
  );
}
