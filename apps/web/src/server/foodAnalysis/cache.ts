import { createHash } from "node:crypto";
import type { AnalyseRepas } from "./schema";

const DUREE_CACHE_MS = 5 * 60_000;

interface EntreeCache {
  resultat: AnalyseRepas;
  expireA: number;
}

/**
 * Dédup légère en mémoire : si la même photo est soumise deux fois (retry
 * utilisateur) dans une courte fenêtre, on renvoie le résultat déjà obtenu
 * plutôt que de repayer un appel API.
 *
 * ⚠️ Best-effort seulement : en environnement serverless (Vercel), chaque
 * instance de fonction a sa propre mémoire et peut être recyclée à tout
 * moment — ce cache ne garantit rien à l'échelle de la prod, il réduit
 * juste les doublons les plus évidents (double-tap sur le même appareil,
 * même instance chaude). Pour une dédup fiable à l'échelle, il faudrait un
 * store partagé (Redis / Vercel KV) — pas encore en place.
 */
const cache = new Map<string, EntreeCache>();

export function hacherImage(imageBase64: string): string {
  return createHash("sha256").update(imageBase64).digest("hex");
}

export function lireDuCache(hash: string): AnalyseRepas | null {
  const entree = cache.get(hash);
  if (!entree) return null;
  if (entree.expireA < Date.now()) {
    cache.delete(hash);
    return null;
  }
  return entree.resultat;
}

export function ecrireDansLeCache(hash: string, resultat: AnalyseRepas): void {
  cache.set(hash, { resultat, expireA: Date.now() + DUREE_CACHE_MS });
}
