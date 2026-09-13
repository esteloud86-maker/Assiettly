"use client";

import { useEffect, useState } from "react";
import { CarteInstallationPwa } from "@/components/onboarding/CarteInstallationPwa";
import { MockupEcranAccueil } from "@/components/onboarding/MockupEcranAccueil";
import { estDejaInstallee } from "@/lib/detectionPlateforme";

/**
 * Écran de fin d'onboarding proposant l'installation en PWA. Ne bloque
 * jamais : "Plus tard" continue le parcours normalement. Si l'app tourne
 * déjà en mode installé (nouveau compte sur un téléphone qui a déjà
 * Assiettly), l'écran se saute tout seul — inutile de le montrer deux fois
 * sur le même appareil.
 */
export function EtapeInstallation({ onContinuer }: { onContinuer: () => void }) {
  const [dejaInstalleeAuDepart, setDejaInstalleeAuDepart] = useState<boolean | null>(null);
  const [installationReussie, setInstallationReussie] = useState(false);

  useEffect(() => {
    const installee = estDejaInstallee();
    setDejaInstalleeAuDepart(installee);
    if (installee) onContinuer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const surAppInstalled = () => setInstallationReussie(true);
    window.addEventListener("appinstalled", surAppInstalled);
    return () => window.removeEventListener("appinstalled", surAppInstalled);
  }, []);

  // Vérification en cours, ou déjà installée (onContinuer vient d'être
  // appelé) : ne rien afficher pour éviter tout flash de contenu inutile.
  if (dejaInstalleeAuDepart !== false) return null;

  return (
    <div className="flex flex-col items-center pt-4 text-center">
      <MockupEcranAccueil />

      <h1 className="mt-6 font-titre text-2xl font-bold text-charbon-800">Garde Assiettly à portée de main</h1>
      <p className="mt-2 text-charbon-400">
        Installée sur ton écran d&rsquo;accueil, elle s&rsquo;ouvre comme une vraie app — plus rapide, sans repasser
        par le navigateur.
      </p>

      <div className="mt-6 w-full">
        <CarteInstallationPwa />
      </div>

      <button
        onClick={onContinuer}
        className={
          installationReussie
            ? "mt-8 w-full rounded-2xl bg-charbon-800 py-3.5 font-titre font-semibold text-white"
            : "mt-8 text-sm font-medium text-charbon-400 underline"
        }
      >
        {installationReussie ? "Continuer" : "Plus tard"}
      </button>
    </div>
  );
}
