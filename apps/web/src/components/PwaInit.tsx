"use client";

import { useEffect } from "react";
import { initCaptureInstallPrompt } from "@/lib/pwaInstallPrompt";

/**
 * Monté une fois à la racine (`app/layout.tsx`), sur toutes les pages —
 * pas seulement à l'écran d'installation. Deux choses doivent démarrer le
 * plus tôt possible dans le cycle de vie de l'app : l'enregistrement du
 * service worker (shell mis en cache dès la première visite) et l'écoute
 * de `beforeinstallprompt`, qui peut arriver bien avant la fin de
 * l'onboarding et ne se déclenche qu'une fois.
 */
export function PwaInit() {
  useEffect(() => {
    initCaptureInstallPrompt();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Pas bloquant : l'app reste utilisable sans service worker (juste
        // moins rapide au rechargement, et non installable).
      });
    }
  }, []);

  return null;
}
