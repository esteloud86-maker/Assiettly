/**
 * Groupes n'est pas encore construit (prévu en phase 2/3, cf. PROGRESS.md).
 * Honnêteté non négociable (cf. brief landing/viralité) : pas de membres, de
 * streaks ni de posts inventés tant que la fonctionnalité n'existe pas
 * réellement — même règle que partout ailleurs dans l'app (démo de scan,
 * avis clients...). Un ancien écran affichait des données fictives ici ;
 * remplacé par un état honnête, sans rien promettre de plus que "bientôt".
 */
export function FluxGroupesMock() {
  return (
    <div className="rounded-2xl bg-creme-50 p-6 text-center shadow-sm">
      <p className="font-titre font-semibold text-charbon-800">Les groupes arrivent bientôt</p>
      <p className="mt-2 text-sm text-charbon-400">
        Défis entre amis et classement de flammes — en construction, rien à montrer pour l&rsquo;instant.
      </p>
    </div>
  );
}
