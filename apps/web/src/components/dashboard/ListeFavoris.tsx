"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { repeterFavori, supprimerFavori } from "@/server/actions/favoris";

const LIBELLES_TYPE: Record<string, string> = {
  PETIT_DEJ: "Petit-déjeuner",
  DEJEUNER: "Déjeuner",
  DINER: "Dîner",
  COLLATION: "Collation",
};

interface FavoriLeger {
  id: string;
  nom: string;
  type: string;
}

export function ListeFavoris({ favoris }: { favoris: FavoriLeger[] }) {
  const router = useRouter();
  const [enCoursId, setEnCoursId] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function repeter(id: string) {
    setErreur(null);
    setEnCoursId(id);
    try {
      await repeterFavori(id);
      router.push("/accueil");
      router.refresh();
    } catch {
      setErreur("Impossible de répéter ce repas, réessaie.");
      setEnCoursId(null);
    }
  }

  async function supprimer(id: string) {
    setEnCoursId(id);
    try {
      await supprimerFavori(id);
      router.refresh();
    } finally {
      setEnCoursId(null);
    }
  }

  return (
    <div className="space-y-2">
      {erreur ? <p className="text-sm text-corail-600">{erreur}</p> : null}
      {favoris.map((favori) => (
        <div key={favori.id} className="flex items-center gap-3 rounded-2xl bg-creme-50 p-4 shadow-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-charbon-800">{favori.nom}</p>
            <p className="text-xs text-charbon-400">{LIBELLES_TYPE[favori.type] ?? favori.type}</p>
          </div>
          <button
            type="button"
            onClick={() => repeter(favori.id)}
            disabled={enCoursId === favori.id}
            className="min-h-11 shrink-0 rounded-xl bg-corail-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {enCoursId === favori.id ? "..." : "Répéter"}
          </button>
          <button
            type="button"
            onClick={() => supprimer(favori.id)}
            disabled={enCoursId === favori.id}
            aria-label="Supprimer ce favori"
            className="flex h-11 w-11 shrink-0 items-center justify-center text-charbon-400 disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
