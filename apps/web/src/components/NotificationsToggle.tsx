"use client";

import { useEffect, useState } from "react";
import { pushEstSupporte, demanderPermissionEtSabonner } from "@/lib/pushClient";
import { enregistrerAbonnementPush, supprimerAbonnementPush } from "@/server/actions/push";

type Statut = "verification" | "non_supporte" | "active" | "inactive" | "en_cours";

export function NotificationsToggle() {
  const [statut, setStatut] = useState<Statut>("verification");

  useEffect(() => {
    if (!pushEstSupporte()) {
      setStatut("non_supporte");
      return;
    }
    navigator.serviceWorker.getRegistration().then(async (registration) => {
      const abonnement = await registration?.pushManager.getSubscription();
      setStatut(abonnement ? "active" : "inactive");
    });
  }, []);

  async function activer() {
    setStatut("en_cours");
    const abonnement = await demanderPermissionEtSabonner();
    if (!abonnement) {
      setStatut("inactive");
      return;
    }
    await enregistrerAbonnementPush(abonnement);
    setStatut("active");
  }

  async function desactiver() {
    setStatut("en_cours");
    const registration = await navigator.serviceWorker.getRegistration();
    const abonnement = await registration?.pushManager.getSubscription();
    if (abonnement) {
      await supprimerAbonnementPush(abonnement.endpoint);
      await abonnement.unsubscribe();
    }
    setStatut("inactive");
  }

  if (statut === "non_supporte") {
    return <p className="text-sm text-charbon-400">Ton navigateur ne supporte pas les notifications push.</p>;
  }
  if (statut === "verification") {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-charbon-600">
        {statut === "active" ? "Rappels de flamme activés" : "Rappels de flamme désactivés"}
      </p>
      <button
        onClick={statut === "active" ? desactiver : activer}
        disabled={statut === "en_cours"}
        className="rounded-xl bg-charbon-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {statut === "en_cours" ? "..." : statut === "active" ? "Désactiver" : "Activer"}
      </button>
    </div>
  );
}
