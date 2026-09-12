"use client";

import { useState } from "react";
import { demanderPermissionEtSabonner } from "@/lib/pushClient";
import { enregistrerAbonnementPush } from "@/server/actions/push";
import type { EtapeProps } from "../types";

type Statut = "inconnu" | "en_cours" | "active" | "refuse";

export function EtapeNotifications({ profil, majProfil }: EtapeProps) {
  const [statut, setStatut] = useState<Statut>(profil.notificationsActivees ? "active" : "inconnu");

  async function activer() {
    setStatut("en_cours");
    try {
      const abonnement = await demanderPermissionEtSabonner();
      if (!abonnement) {
        setStatut("refuse");
        return;
      }
      await enregistrerAbonnementPush(abonnement);
      majProfil("notificationsActivees", true);
      setStatut("active");
    } catch {
      setStatut("refuse");
    }
  }

  return (
    <div>
      <div className="rounded-2xl bg-creme-50 p-6 text-center">
        <p className="text-4xl">🔔</p>
        <h1 className="mt-2 font-titre text-2xl font-bold text-charbon-800">Ne perds jamais ta flamme</h1>
        <p className="mt-1 text-sm text-charbon-400">
          Active les notifications pour recevoir un rappel si ta flamme risque de s&rsquo;éteindre en fin de
          journée.
        </p>
      </div>
      {statut === "active" ? (
        <p className="mt-4 text-center font-medium text-sarcelle-600">Notifications activées ✓</p>
      ) : statut === "refuse" ? (
        <p className="mt-4 text-center text-sm text-charbon-400">
          Pas de souci, tu pourras les activer plus tard depuis ton profil.
        </p>
      ) : (
        <button
          onClick={activer}
          disabled={statut === "en_cours"}
          className="mt-4 w-full rounded-2xl bg-corail-500 py-3.5 font-titre font-semibold text-white disabled:opacity-50"
        >
          {statut === "en_cours" ? "..." : "Activer les notifications"}
        </button>
      )}
    </div>
  );
}
