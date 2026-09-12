import { MoletteValeur } from "./MoletteValeur";
import { MoletteValeurGenerique } from "./MoletteValeurGenerique";

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

interface SelectDateNaissanceProps {
  valeur: string; // ISO yyyy-mm-dd
  onChange: (iso: string) => void;
}

function decomposer(iso: string) {
  if (!iso) {
    const auj = new Date();
    return { jour: auj.getDate(), mois: auj.getMonth() + 1, annee: auj.getFullYear() - 25 };
  }
  const [annee, mois, jour] = iso.split("-").map(Number);
  return { jour, mois, annee };
}

export function SelectDateNaissance({ valeur, onChange }: SelectDateNaissanceProps) {
  const { jour, mois, annee } = decomposer(valeur);
  const anneeActuelle = new Date().getFullYear();

  function emettre(j: number, m: number, a: number) {
    onChange(`${a}-${String(m).padStart(2, "0")}-${String(j).padStart(2, "0")}`);
  }

  return (
    <div className="flex justify-center gap-2">
      <MoletteValeur min={1} max={31} valeur={jour} onChange={(v) => emettre(v, mois, annee)} largeur="70px" />
      <div className="w-28">
        <MoletteValeurGenerique options={MOIS} index={mois - 1} onChange={(i) => emettre(jour, i + 1, annee)} />
      </div>
      <MoletteValeur
        min={anneeActuelle - 100}
        max={anneeActuelle - 10}
        valeur={annee}
        onChange={(v) => emettre(jour, mois, v)}
        largeur="90px"
      />
    </div>
  );
}
