"use client";

import { useState, useTransition } from "react";
import { terminerOnboarding } from "@/server/actions/onboarding";
import { EtapeActivite } from "./etapes/EtapeActivite";
import { EtapeAlimentation } from "./etapes/EtapeAlimentation";
import { EtapeAppSuivi } from "./etapes/EtapeAppSuivi";
import { EtapeCalculFinal } from "./etapes/EtapeCalculFinal";
import { EtapeCoach } from "./etapes/EtapeCoach";
import { EtapeDateNaissance } from "./etapes/EtapeDateNaissance";
import { EtapeFreins } from "./etapes/EtapeFreins";
import { EtapeMotivation } from "./etapes/EtapeMotivation";
import { EtapeNotifications } from "./etapes/EtapeNotifications";
import { EtapeObjectif } from "./etapes/EtapeObjectif";
import { EtapePoidsActuel } from "./etapes/EtapePoidsActuel";
import { EtapePoidsCible } from "./etapes/EtapePoidsCible";
import { EtapeSexe } from "./etapes/EtapeSexe";
import { EtapeTaille } from "./etapes/EtapeTaille";
import { PROFIL_ONBOARDING_INITIAL, type EtapeProps, type ProfilOnboarding } from "./types";

interface ConfigEtape {
  composant: (props: EtapeProps) => React.ReactNode;
  peutContinuer: (p: ProfilOnboarding) => boolean;
}

const ETAPES: ConfigEtape[] = [
  { composant: EtapeSexe, peutContinuer: (p) => !!p.sexe },
  { composant: EtapeDateNaissance, peutContinuer: (p) => !!p.dateNaissance },
  { composant: EtapeActivite, peutContinuer: (p) => !!p.niveauActivite },
  { composant: EtapeTaille, peutContinuer: (p) => !!p.tailleCm },
  { composant: EtapePoidsActuel, peutContinuer: (p) => !!p.poidsKg },
  { composant: EtapeAppSuivi, peutContinuer: (p) => p.dejaUtiliseAppSuivi !== null },
  { composant: EtapeCoach, peutContinuer: (p) => p.suiviParCoach !== null },
  { composant: EtapeObjectif, peutContinuer: (p) => !!p.objectifType },
  { composant: EtapeFreins, peutContinuer: () => true },
  { composant: EtapePoidsCible, peutContinuer: (p) => !!p.poidsCibleKg },
  { composant: EtapeAlimentation, peutContinuer: (p) => !!p.typeAlimentation },
  { composant: EtapeMotivation, peutContinuer: (p) => !!p.motivationPrincipale },
  { composant: EtapeNotifications, peutContinuer: () => true },
];

const TOTAL_ETAPES = ETAPES.length + 1; // + l'écran de calcul final

export function OnboardingWizard() {
  const [etape, setEtape] = useState(0);
  const [profil, setProfil] = useState<ProfilOnboarding>(PROFIL_ONBOARDING_INITIAL);
  const [erreur, setErreur] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function majProfil<K extends keyof ProfilOnboarding>(cle: K, valeur: ProfilOnboarding[K]) {
    setProfil((p) => ({ ...p, [cle]: valeur }));
  }

  function soumettre() {
    setErreur(null);
    startTransition(async () => {
      try {
        await terminerOnboarding({
          sexe: profil.sexe!,
          dateNaissance: profil.dateNaissance,
          niveauActivite: profil.niveauActivite!,
          tailleCm: Number(profil.tailleCm),
          poidsKg: Number(profil.poidsKg),
          dejaUtiliseAppSuivi: profil.dejaUtiliseAppSuivi!,
          suiviParCoach: profil.suiviParCoach!,
          objectifType: profil.objectifType!,
          freins: profil.freins,
          poidsCibleKg: Number(profil.poidsCibleKg),
          typeAlimentation: profil.typeAlimentation!,
          motivationPrincipale: profil.motivationPrincipale!,
        });
      } catch (e) {
        setErreur(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
      }
    });
  }

  const surEcranFinal = etape === ETAPES.length;

  if (surEcranFinal) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10">
        <EtapeCalculFinal profil={profil} onTermine={soumettre} erreur={erreur} />
      </div>
    );
  }

  const { composant: Etape, peutContinuer } = ETAPES[etape];

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        {etape > 0 ? (
          <button
            onClick={() => setEtape((e) => e - 1)}
            aria-label="Précédent"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-creme-100 text-charbon-800"
          >
            ←
          </button>
        ) : (
          <div className="h-9 w-9 shrink-0" />
        )}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-creme-200">
          <div
            className="h-full rounded-full bg-corail-500 transition-all duration-300"
            style={{ width: `${((etape + 1) / TOTAL_ETAPES) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1">
        <Etape profil={profil} majProfil={majProfil} />
      </div>

      <button
        onClick={() => setEtape((e) => e + 1)}
        disabled={!peutContinuer(profil)}
        className="mt-8 w-full rounded-2xl bg-charbon-800 py-3.5 font-titre font-semibold text-white disabled:bg-creme-200 disabled:text-charbon-400"
      >
        Continuer
      </button>
    </div>
  );
}
