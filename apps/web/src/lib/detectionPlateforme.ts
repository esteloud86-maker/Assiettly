export type Plateforme = "ios" | "android" | "desktop";

/**
 * Détection de plateforme par user agent — il n'existe pas d'API de
 * feature-detection fiable pour distinguer iOS/Android/desktop (contrairement
 * à la détection de fonctionnalités comme le touch, qui existe aussi sur
 * certains laptops). Gère le cas iPadOS 13+, qui se présente comme un Mac
 * mais garde un `navigator.standalone` et un écran tactile.
 */
export function detecterPlateforme(): Plateforme {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;

  const estIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  if (estIOS) return "ios";

  if (/Android/.test(ua)) return "android";

  return "desktop";
}

/** Vrai si l'app tourne déjà en mode installé (standalone), sur iOS comme sur Android/Chrome. */
export function estDejaInstallee(): boolean {
  if (typeof window === "undefined") return false;
  const standaloneNavigateur = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  // Propriété historique de Safari iOS — display-mode: standalone n'y est
  // pas toujours fiable, `navigator.standalone` reste le signal le plus sûr.
  const standaloneIOS = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standaloneNavigateur || standaloneIOS;
}
