/**
 * Bloc de contenu en cours de chargement (placeholder pulsé) — utilisé dans
 * les `loading.tsx` de chaque section du dashboard pour qu'un changement de
 * page affiche immédiatement une mise en page reconnaissable plutôt qu'un
 * écran blanc pendant l'aller-retour serveur.
 */
export function BlocSquelette({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-creme-200/70 ${className}`} />;
}
