import { MoletteValeur } from "../primitives/MoletteValeur";
import type { EtapeProps } from "../types";

export function EtapePoidsActuel({ profil, majProfil }: EtapeProps) {
  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">Quel est ton poids actuel ?</h1>
      <p className="mb-6 text-charbon-400">On s&rsquo;en sert comme point de départ, tu pourras l&rsquo;ajuster ensuite.</p>
      <div className="flex justify-center">
        <MoletteValeur
          min={35}
          max={180}
          valeur={profil.poidsKg ? Number(profil.poidsKg) : null}
          onChange={(v) => majProfil("poidsKg", String(v))}
          suffixe="kg"
        />
      </div>
    </div>
  );
}
