/**
 * Avis réels d'utilisateurs Assiettly — source unique, éditée à la main.
 *
 * Honnêteté non négociable (cf. brief landing) : jamais d'avis inventé,
 * jamais de note moyenne ou de nombre d'utilisateurs fabriqué nulle part
 * dans l'app. Un avis sans `consentement: true` ne s'affiche jamais (cf.
 * `src/lib/avis.ts`) — ne mets `true` que si la personne a explicitement
 * accepté que son avis soit publié sur le site.
 *
 * Marche à suivre pour ajouter un vrai avis (documentée aussi dans
 * PROGRESS.md) :
 * 1. Ajoute un objet à la fin du tableau `AVIS` ci-dessous, avec un `id`
 *    unique (ex. "2026-03-nom"), le prénom ou l'initiale que la personne a
 *    choisi d'afficher, son texte tel quel (ne pas le réécrire), une `note`
 *    si elle en a donné une (1 à 5, facultatif), la `date` au format
 *    AAAA-MM-JJ, et `consentement: true` **seulement si elle a accepté**.
 * 2. Rien d'autre à toucher : le design, l'affichage et le lien de
 *    navigation se mettent à jour automatiquement. La section reste
 *    masquée (ni titre, ni ancre, ni espace vide) tant qu'il y a moins de
 *    3 avis valides au total (cf. `SEUIL_AFFICHAGE` dans `src/lib/avis.ts`).
 */
export interface Avis {
  id: string;
  prenom: string;
  texte: string;
  /** 1 à 5, facultatif — ne jamais inventer de note si la personne n'en a pas donné. */
  note?: number;
  /** Format AAAA-MM-JJ. */
  date: string;
  /** `true` uniquement si la personne a explicitement consenti à la publication. */
  consentement: true;
}

export const AVIS: Avis[] = [];
