import { calculerFourchettePoidsSain } from "@assiettly/shared";
import { EncartAvertissement } from "../primitives/EncartAvertissement";
import { MoletteValeur } from "../primitives/MoletteValeur";
import type { EtapeProps } from "../types";

export function EtapePoidsCible({ profil, majProfil }: EtapeProps) {
  const poidsCible = profil.poidsCibleKg ? Number(profil.poidsCibleKg) : null;
  const fourchette = profil.tailleCm ? calculerFourchettePoidsSain(Number(profil.tailleCm)) : null;
  const horsFourchette =
    fourchette && poidsCible && (poidsCible < fourchette.minKg || poidsCible > fourchette.maxKg);

  return (
    <div>
      <h1 className="mb-2 font-titre text-2xl font-bold text-charbon-800">Quel est ton poids souhaité ?</h1>
      <p className="mb-6 text-charbon-400">Tu pourras toujours l&rsquo;ajuster plus tard.</p>
      <div className="flex justify-center">
        <MoletteValeur
          min={35}
          max={180}
          valeur={poidsCible}
          onChange={(v) => majProfil("poidsCibleKg", String(v))}
          suffixe="kg"
        />
      </div>
      {horsFourchette ? (
        <div className="mt-6">
          <EncartAvertissement>
            Cet objectif semble {poidsCible! < fourchette!.minKg ? "un peu bas" : "un peu élevé"} par rapport à ta
            taille. Pas de souci si c&rsquo;est volontaire — n&rsquo;hésite juste pas à en parler à un professionnel
            de santé si besoin.
          </EncartAvertissement>
        </div>
      ) : null}
    </div>
  );
}
