/**
 * Capture et stockage de l'événement `beforeinstallprompt` (Android/Chrome).
 *
 * Le navigateur ne l'envoie qu'une fois, tôt dans le cycle de vie de la
 * page, et il ne peut être déclenché (`.prompt()`) que depuis une
 * interaction utilisateur directe — pas question d'attendre que
 * l'utilisateur arrive sur l'écran d'installation de l'onboarding pour
 * commencer à l'écouter, il serait déjà passé. `initCapture()` est donc
 * appelé une fois, au niveau racine de l'app (`PwaInit`), et le résultat
 * est gardé dans ce module le temps que l'écran d'installation (ou le
 * profil) en ait besoin.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let evenementDiffere: BeforeInstallPromptEvent | null = null;
let captureDemarree = false;
const abonnes = new Set<() => void>();

function notifierAbonnes() {
  abonnes.forEach((cb) => cb());
}

export function initCaptureInstallPrompt() {
  if (captureDemarree || typeof window === "undefined") return;
  captureDemarree = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    evenementDiffere = e as BeforeInstallPromptEvent;
    notifierAbonnes();
  });

  // Le navigateur envoie cet événement quand l'installation vient de se
  // terminer (bouton natif ou notre propre déclenchement) — on nettoie
  // l'événement stocké, il ne sert plus à rien.
  window.addEventListener("appinstalled", () => {
    evenementDiffere = null;
    notifierAbonnes();
  });
}

/** S'abonne aux changements de disponibilité du prompt ; retourne une fonction de désabonnement. */
export function abonnerPromptInstallation(callback: () => void): () => void {
  abonnes.add(callback);
  return () => abonnes.delete(callback);
}

export function promptInstallationDisponible(): boolean {
  return evenementDiffere !== null;
}

/**
 * Déclenche la boîte de dialogue système. Ne fonctionne qu'une fois par
 * événement capté (contrainte du navigateur) — l'appelant doit vérifier
 * `promptInstallationDisponible()` avant d'afficher un bouton actif.
 */
export async function declencherInstallation(): Promise<"accepted" | "dismissed" | "indisponible"> {
  if (!evenementDiffere) return "indisponible";
  const evenement = evenementDiffere;
  evenementDiffere = null;
  notifierAbonnes();

  await evenement.prompt();
  const { outcome } = await evenement.userChoice;
  return outcome;
}
