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

/**
 * Vrai si la page tourne dans le navigateur intégré d'une appli tierce
 * (Instagram, TikTok — la source de trafic principale d'Assiettly ; Facebook/
 * Messenger inclus en bonus car même symptôme et détection quasi gratuite).
 * Google bloque explicitement OAuth dans ces webviews (erreur
 * `disallowed_useragent`) — impossible à contourner, il faut ouvrir le lien
 * dans un vrai navigateur.
 */
export function estNavigateurInApp(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Instagram|TikTok|BytedanceWebview|FBAN|FBAV|FB_IAB/i.test(navigator.userAgent);
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
