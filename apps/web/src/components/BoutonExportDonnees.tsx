"use client";

import { useState } from "react";
import { exporterMesDonnees } from "@/server/actions/rgpd";

/** Télécharge toutes les données personnelles de l'utilisateur en JSON (droit RGPD à la portabilité). */
export function BoutonExportDonnees() {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function exporter() {
    setErreur(null);
    setEnCours(true);
    try {
      const donnees = await exporterMesDonnees();
      const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = `assiettly-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErreur("L'export a échoué, réessaie dans quelques instants.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={exporter}
        disabled={enCours}
        className="rounded-xl border border-creme-200 bg-white px-5 py-2.5 font-semibold text-charbon-800 disabled:opacity-50"
      >
        {enCours ? "Préparation..." : "Exporter mes données"}
      </button>
      {erreur ? <p className="mt-2 text-sm text-corail-600">{erreur}</p> : null}
    </div>
  );
}
