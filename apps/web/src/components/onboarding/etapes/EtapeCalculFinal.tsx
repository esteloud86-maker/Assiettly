"use client";

import { calculerObjectifs, type Sexe } from "@assiettly/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProfilOnboarding } from "../types";

interface EtapeCalculFinalProps {
  profil: ProfilOnboarding;
  onTermine: () => void;
  erreur: string | null;
}

const METRIQUES = [
  { seuil: 20, label: "Calories" },
  { seuil: 40, label: "Glucides" },
  { seuil: 60, label: "Protéines" },
  { seuil: 80, label: "Lipides" },
  { seuil: 100, label: "Score santé" },
];

const DUREE_MS = 2200;

/**
 * Écran final : calcule réellement les objectifs (Mifflin-St Jeor) pendant
 * l'animation, puis déclenche la soumission au backend une fois à 100%.
 */
export function EtapeCalculFinal({ profil, onTermine, erreur }: EtapeCalculFinalProps) {
  const [pourcentage, setPourcentage] = useState(0);
  const declenche = useRef(false);

  const objectifs = useMemo(() => {
    if (!profil.sexe || !profil.dateNaissance || !profil.tailleCm || !profil.poidsKg || !profil.niveauActivite || !profil.objectifType) {
      return null;
    }
    return calculerObjectifs({
      sexe: profil.sexe as Sexe,
      dateNaissance: profil.dateNaissance,
      tailleCm: Number(profil.tailleCm),
      poidsKg: Number(profil.poidsKg),
      niveauActivite: profil.niveauActivite,
      objectifType: profil.objectifType,
    });
  }, [profil]);

  useEffect(() => {
    const debut = Date.now();
    const intervalle = setInterval(() => {
      const ratio = Math.min(1, (Date.now() - debut) / DUREE_MS);
      setPourcentage(Math.round(ratio * 100));
      if (ratio >= 1) {
        clearInterval(intervalle);
        if (!declenche.current) {
          declenche.current = true;
          onTermine();
        }
      }
    }, 30);
    return () => clearInterval(intervalle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center pt-6 text-center">
      <h1 className="mb-1 font-titre text-2xl font-bold text-charbon-800">On prépare ton plan sur mesure</h1>
      <p className="mb-8 text-charbon-400">Quelques secondes, on calcule tes besoins précis.</p>

      <div className="mb-2 font-titre text-5xl font-bold text-charbon-800">{pourcentage}%</div>

      <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-creme-200">
        <div
          className="h-full rounded-full transition-[width] duration-100"
          style={{
            width: `${pourcentage}%`,
            background: "linear-gradient(90deg, #F2603C 0%, #F2953C 55%, #1F7A6C 100%)",
          }}
        />
      </div>

      <div className="w-full space-y-2">
        {METRIQUES.map((m) => {
          const pret = pourcentage >= m.seuil;
          return (
            <div
              key={m.label}
              className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                pret ? "bg-sarcelle-50" : "bg-creme-50"
              }`}
            >
              <span className={`font-medium ${pret ? "text-sarcelle-600" : "text-charbon-400"}`}>{m.label}</span>
              <span className={pret ? "text-sarcelle-600" : "text-charbon-400"}>
                {pret ? "✓" : "…"}
                {pret && objectifs && m.label === "Calories" ? ` ${objectifs.caloriesKcal} kcal` : null}
              </span>
            </div>
          );
        })}
      </div>

      {erreur ? <p className="mt-6 text-corail-600">{erreur}</p> : null}
    </div>
  );
}
