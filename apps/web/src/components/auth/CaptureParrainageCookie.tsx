"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Lien de parrainage (/inscription?ref=CODE) : posé en cookie ici, lu côté
 * serveur à la création du profil (cf. server/auth.ts) — survit à la
 * redirection OAuth Google puisque c'est la même origine avant et après.
 * 7 jours : largement assez pour finir une inscription commencée depuis ce
 * lien, sans traîner indéfiniment si la personne revient des mois après
 * sans repasser par le lien.
 *
 * Isolé dans son propre composant (plutôt que directement dans
 * InscriptionPage) : `useSearchParams()` exige une limite <Suspense>, et
 * l'isoler ici évite de rendre toute la page d'inscription dépendante de
 * cette limite.
 */
export function CaptureParrainageCookie() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      document.cookie = `assiettly_ref=${encodeURIComponent(ref)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
  }, [searchParams]);

  return null;
}
