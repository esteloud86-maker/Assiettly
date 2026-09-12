"use client";

import { useState } from "react";
import { PoidsForm } from "@/components/PoidsForm";

export function CartePoidsActuel({
  poidsActuelKg,
  poidsCibleKg,
  poidsInitialKg,
}: {
  poidsActuelKg: number | null;
  poidsCibleKg: number | null;
  poidsInitialKg: number | null;
}) {
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);

  let pct: number | null = null;
  if (poidsActuelKg !== null && poidsCibleKg !== null && poidsInitialKg !== null && poidsInitialKg !== poidsCibleKg) {
    pct = Math.min(1, Math.max(0, (poidsInitialKg - poidsActuelKg) / (poidsInitialKg - poidsCibleKg)));
  }

  return (
    <div className="rounded-2xl bg-creme-50 p-4 shadow-sm">
      <p className="text-xs font-medium text-charbon-400">Ton poids</p>
      <p className="mt-1 font-titre text-2xl font-bold text-charbon-800">
        {poidsActuelKg !== null ? `${poidsActuelKg} kg` : "—"}
      </p>
      {pct !== null ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-creme-200">
          <div className="h-full rounded-full bg-sarcelle-500" style={{ width: `${pct * 100}%` }} />
        </div>
      ) : null}
      {poidsCibleKg !== null ? (
        <p className="mt-1 text-xs text-charbon-400">Objectif : {poidsCibleKg} kg</p>
      ) : null}

      <button
        onClick={() => setFormulaireOuvert((o) => !o)}
        className="mt-3 w-full rounded-xl bg-corail-500 py-2 text-sm font-semibold text-white hover:bg-corail-600"
      >
        {formulaireOuvert ? "Fermer" : "+ Ajouter un poids"}
      </button>
      {formulaireOuvert ? (
        <div className="mt-3">
          <PoidsForm />
        </div>
      ) : null}
    </div>
  );
}
