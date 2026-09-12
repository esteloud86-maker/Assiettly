import { ChoixOuiNon } from "../primitives/ChoixOuiNon";
import type { EtapeProps } from "../types";

export function EtapeAppSuivi({ profil, majProfil }: EtapeProps) {
  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">
        As-tu déjà utilisé une app de suivi calorique ?
      </h1>
      <p className="mb-6 text-charbon-400">Pas de jugement, juste pour savoir d&rsquo;où tu pars.</p>
      <ChoixOuiNon valeur={profil.dejaUtiliseAppSuivi} onChange={(v) => majProfil("dejaUtiliseAppSuivi", v)} />
    </div>
  );
}
