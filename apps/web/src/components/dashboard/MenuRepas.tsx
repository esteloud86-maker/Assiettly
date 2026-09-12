"use client";

import { useState } from "react";
import { supprimerRepasEtRevenir } from "@/server/actions/meals";

export function MenuRepas({ mealId }: { mealId: string }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOuvert((o) => !o)}
        aria-label="Options"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-creme-50/90 text-charbon-800 shadow-sm"
      >
        ⋯
      </button>
      {ouvert ? (
        <div className="absolute right-0 top-11 z-10 w-44 rounded-xl bg-creme-50 py-1 shadow-lg">
          <form action={supprimerRepasEtRevenir.bind(null, mealId)}>
            <button type="submit" className="w-full px-4 py-2 text-left text-sm text-corail-600 hover:bg-creme-200">
              Supprimer ce repas
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
