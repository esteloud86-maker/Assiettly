import { MoletteValeur } from "../primitives/MoletteValeur";
import type { EtapeProps } from "../types";

export function EtapeTaille({ profil, majProfil }: EtapeProps) {
  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">Quelle est ta taille ?</h1>
      <p className="mb-6 text-charbon-400">Fais défiler pour choisir.</p>
      <div className="flex justify-center">
        <MoletteValeur
          min={130}
          max={220}
          valeur={profil.tailleCm ? Number(profil.tailleCm) : null}
          onChange={(v) => majProfil("tailleCm", String(v))}
          suffixe="cm"
        />
      </div>
    </div>
  );
}
