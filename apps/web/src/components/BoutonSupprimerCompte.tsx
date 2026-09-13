"use client";

import { useState, useTransition } from "react";
import { supprimerMonCompte } from "@/server/actions/rgpd";

const MOT_CONFIRMATION = "SUPPRIMER";

/**
 * Suppression de compte (droit RGPD à l'effacement) — action irréversible et
 * destructrice, donc protégée par une saisie de confirmation explicite
 * plutôt qu'un simple bouton, pour éviter une suppression accidentelle.
 */
export function BoutonSupprimerCompte() {
  const [ouvert, setOuvert] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmer() {
    setErreur(null);
    startTransition(async () => {
      try {
        await supprimerMonCompte();
      } catch {
        setErreur("La suppression a échoué, réessaie ou contacte le support.");
      }
    });
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="rounded-xl border border-corail-200 px-5 py-2.5 font-semibold text-corail-600"
      >
        Supprimer mon compte
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-corail-200 bg-corail-50 p-4">
      <p className="text-sm text-charbon-800">
        Cette action est <strong>définitive</strong> : ton profil, tes repas, ton historique de poids, ta série et
        ton abonnement seront supprimés. Pour confirmer, tape{" "}
        <strong>{MOT_CONFIRMATION}</strong> ci-dessous.
      </p>
      <input
        value={saisie}
        onChange={(e) => setSaisie(e.target.value)}
        className="w-full rounded-xl border border-creme-200 bg-white p-3"
        placeholder={MOT_CONFIRMATION}
        autoComplete="off"
      />
      {erreur ? <p className="text-sm text-corail-600">{erreur}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOuvert(false);
            setSaisie("");
            setErreur(null);
          }}
          className="flex-1 rounded-xl border border-creme-200 bg-white py-2.5 font-semibold text-charbon-800"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={confirmer}
          disabled={saisie !== MOT_CONFIRMATION || isPending}
          className="flex-1 rounded-xl bg-corail-600 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "Suppression..." : "Supprimer définitivement"}
        </button>
      </div>
    </div>
  );
}
