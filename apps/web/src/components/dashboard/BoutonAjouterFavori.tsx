"use client";

import Link from "next/link";
import { useState } from "react";
import { ajouterFavori } from "@/server/actions/favoris";

/** Étoile "Ajouter aux favoris" sur l'écran de détail d'un repas — Premium uniquement. */
export function BoutonAjouterFavori({ mealId, nom, premium }: { mealId: string; nom: string; premium: boolean }) {
  const [etat, setEtat] = useState<"inactif" | "en_cours" | "fait">("inactif");

  if (!premium) {
    return (
      <Link
        href="/paywall?source=favoris"
        aria-label="Ajouter aux favoris (Premium)"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-creme-50/90 text-xl text-charbon-400 shadow-sm"
      >
        ☆
      </Link>
    );
  }

  async function ajouter() {
    setEtat("en_cours");
    try {
      await ajouterFavori(mealId, nom);
      setEtat("fait");
    } catch {
      setEtat("inactif");
    }
  }

  return (
    <button
      type="button"
      onClick={ajouter}
      disabled={etat !== "inactif"}
      aria-label={etat === "fait" ? "Ajouté aux favoris" : "Ajouter aux favoris"}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-creme-50/90 text-xl text-charbon-800 shadow-sm disabled:opacity-80"
    >
      {etat === "fait" ? "★" : "☆"}
    </button>
  );
}
