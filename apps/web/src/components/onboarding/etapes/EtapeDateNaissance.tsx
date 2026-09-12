import { SelectDateNaissance } from "../primitives/SelectDateNaissance";
import type { EtapeProps } from "../types";

export function EtapeDateNaissance({ profil, majProfil }: EtapeProps) {
  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">Quelle est ta date de naissance ?</h1>
      <p className="mb-6 text-charbon-400">L&rsquo;âge entre dans le calcul de ton métabolisme de base.</p>
      <SelectDateNaissance valeur={profil.dateNaissance} onChange={(v) => majProfil("dateNaissance", v)} />
    </div>
  );
}
