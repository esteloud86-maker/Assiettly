import { ChoixOuiNon } from "../primitives/ChoixOuiNon";
import type { EtapeProps } from "../types";

export function EtapeCoach({ profil, majProfil }: EtapeProps) {
  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">
        Travailles-tu avec un coach ou un·e diététicien·ne ?
      </h1>
      <p className="mb-6 text-charbon-400">Assiettly peut compléter un suivi existant, sans problème.</p>
      <ChoixOuiNon valeur={profil.suiviParCoach} onChange={(v) => majProfil("suiviParCoach", v)} />
    </div>
  );
}
