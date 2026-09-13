# Journal de progression — Assiettly

## Pivot majeur — Assiettly est un SaaS web, pas une app mobile

Après le premier MVP (React Native/Expo + API Fastify séparée, voir
l'historique git), le brief a été précisé : **Assiettly est un SaaS web**,
pas une app mobile — paiement Stripe, déploiement Vercel, Supabase pour
auth/DB, API Claude prévue pour l'IA vision. En conséquence :

- `apps/mobile` (Expo/React Native) et `apps/api` (Fastify) ont été
  **retirés**.
- Remplacés par `apps/web`, une app **Next.js 14 (App Router)** unique :
  Server Components pour l'affichage, **Server Actions** pour les mutations
  (plus besoin d'API REST séparée), Prisma pour l'accès à la base Supabase.
- `packages/shared` (calcul nutritionnel, logique de streak, schémas zod)
  est conservé tel quel — c'est la logique métier, indépendante du frontend.

## Décisions produit (validées avec l'utilisateur)

| Sujet | Choix |
|---|---|
| Type de produit | SaaS web (pas mobile) |
| Frontend/Backend | Next.js App Router sur Vercel (remplace Fastify) |
| Paiement | Stripe Checkout, essai gratuit 7 jours carte requise |
| Auth & DB | Supabase (inchangé) |
| IA vision (futur) | API Claude (Anthropic) |
| Identité de marque | Direction proposée par Claude (palette + typo ci-dessous) |

## Identité de marque Assiettly

Ton chaleureux, simple, motivant, jamais culpabilisant. Palette volontairement
distincte des apps concurrentes (pas de rouge/orange "type CalAI" pur) :
- **Corail** (`#F2603C`) : couleur d'action (boutons, flamme).
- **Sarcelle** (`#1F7A6C`) : accent santé/fraîcheur (glucides, succès).
- **Ambre** (`#F2953C`) : mécanique de la flamme (dégradé avec le corail).
- **Ivoire chaud** (`#FBF4EC`) : fond, plus doux qu'un blanc pur.
- **Typographie** : Fredoka (titres, arrondie) + Inter (corps de texte).
- **Marque flamme** : icône SVG dessinée pour la marque (`FlammeIcon.tsx`),
  pas un émoji — dégradé ambre → corail, forme arrondie.

## Architecture technique détaillée

```
apps/web/
  prisma/schema.prisma   Profile, Goal, WeightLog, Food, Meal/MealItem,
                          StreakDay/StreakSummary, Subscription
  src/
    middleware.ts         Rafraîchit la session Supabase, protège les routes
    lib/
      supabase/client.ts  Client navigateur (composants client)
      supabase/server.ts  Client serveur (Server Components/Actions)
      prisma.ts           Instance Prisma partagée
      stripe.ts           Instance Stripe
    server/
      auth.ts             getCurrentProfile / requireProfile
      streak.ts           Recalcul de streak (port de l'ancienne API Fastify)
      openFoodFacts.ts    Lookup code-barres (port identique)
      billing.ts          estPremium(), durée d'essai
      actions/            Server Actions : onboarding, meals, weight,
                          streaks, billing (Stripe Checkout + portail)
    app/
      page.tsx             Landing
      connexion, inscription   Auth (client, Supabase browser client)
      onboarding/           Wizard multi-étapes (calcul instantané côté
                            client via packages/shared, persistance via
                            Server Action à la fin)
      paywall/              Comparatif gratuit/premium + Stripe Checkout
      (app)/                Route group protégée (layout avec header +
                            badge flamme + nav) :
        accueil/            Anneau de progression calorique + macros
        journal/            Repas du jour + ajout (recherche/code-barres)
        poids/               Suivi de poids + graphique SVG
        streaks/calendrier/  Calendrier mensuel des flammes
        profil/              Infos + gestion abonnement Stripe
      api/webhooks/stripe/  Webhook (synchronise Subscription depuis Stripe)
```

**Paiement** : `demarrerAbonnement` crée un client Stripe (si besoin) et une
session Checkout avec `trial_period_days: 7` — la carte est demandée à
l'inscription à l'essai mais n'est débitée qu'à la fin des 7 jours, conforme
au choix validé. Le webhook Stripe synchronise le modèle `Subscription`
(statut, dates) à chaque changement.

**Onboarding** : les calculs (Mifflin-St Jeor, macros, projection de date
d'objectif) sont faits **côté client** en direct avec `packages/shared`
pour un affichage instantané à chaque étape ; la persistance (profil,
premier poids, objectif actif) se fait via une seule Server Action à la
dernière étape, qui redirige ensuite vers `/paywall`.

## Vérification end-to-end

Le parcours complet a été testé avec un navigateur piloté automatiquement :
inscription (bypass technique décrit ci-dessous) → onboarding en 8 étapes →
écran de résultats → projection → paywall → dashboard avec anneau → ajout de
repas (recherche + quantité ajustable) → flamme qui s'allume → calendrier →
poids avec graphique. `next build` passe sans erreur (15 routes générées).

**Limite de cet environnement de test** : le réseau sortant vers
`*.supabase.co` est bloqué par la politique de cet environnement, donc l'auth
Supabase réelle et les appels Stripe n'ont pas pu être exercés en conditions
réelles ici. Pour le test, `getCurrentProfile`/`middleware.ts` ont été
temporairement modifiés pour simuler un utilisateur connecté (variable
`DEV_BYPASS_AUTH`), le temps de vérifier le reste de l'application — ce
contournement a été entièrement retiré avant le commit (vérifié par `git
diff` et un nouveau `next build`/`typecheck` propres). Un bug UX réel a été
trouvé et corrigé pendant ce test : la quantité d'un aliment ajouté au panier
était figée à 100 g sans possibilité de l'ajuster (`AjouterRepasForm.tsx`
propose maintenant un champ éditable).

## Mise en production (Vercel + Supabase + Stripe réels)

Déployé sur Vercel (`assiettly-web.vercel.app`, puis domaine `assiettly.fr`).
Problèmes rencontrés et corrigés en cours de route :
- **Build Vercel échouait** (`implicitly has an 'any' type` sur les résultats
  Prisma) : `@prisma/client` n'était jamais régénéré après un install propre
  dans ce monorepo pnpm. Fix : `"postinstall": "prisma generate"` dans
  `apps/web/package.json`.
- **Connexion Postgres directe (port 5432, `db.<ref>.supabase.co`) instable
  depuis les fonctions serverless Vercel** : basculé sur le pooler Supavisor
  de Supabase — `DATABASE_URL` (pooler transaction-mode, port 6543,
  `pgbouncer=true`) pour les requêtes à l'exécution, `DIRECT_URL` (pooler
  session-mode, port 5432) pour les migrations Prisma. Ajout de
  `directUrl = env("DIRECT_URL")` dans `schema.prisma`.
- Domaine `assiettly.fr` connecté sur Vercel, `www` redirigé vers l'apex.
  `NEXT_PUBLIC_APP_URL`, l'URL du webhook Stripe et le "Site URL"/"Redirect
  URLs" de Supabase Auth mis à jour en conséquence.

## Rappels de flamme par e-mail (Resend)

Ajout d'un envoi quotidien automatique : chaque profil dont la flamme est
allumée (`streakSummary.streakActuel > 0`) mais qui n'a encore ajouté aucun
repas dans la journée reçoit un e-mail "Ne perds pas ta flamme !".

- `apps/web/emails/components/EmailLayout.tsx` : habillage commun aux
  couleurs de la marque (corail/ivoire/charbon), réutilisable pour de
  futurs e-mails (bienvenue, fin d'essai...).
- `apps/web/emails/RappelFlamme.tsx` : template du rappel, construit avec
  React Email (`@react-email/components`).
- `apps/web/src/app/api/cron/streak-reminders/route.ts` : route protégée
  par `CRON_SECRET` (vérifié contre l'en-tête `Authorization` que Vercel
  Cron ajoute automatiquement), interroge Prisma pour trouver les profils
  concernés, envoie via Resend (`src/lib/resend.ts`).
- `apps/web/vercel.json` : déclare le cron (`0 18 * * *`, soit ~19h/20h
  heure française), compatible avec les limites du plan Vercel Hobby (une
  exécution par jour).
- Rendu vérifié localement (`@react-email/render` + capture d'écran) avant
  de livrer — voir l'aperçu envoyé dans la conversation.

À faire côté services externes (utilisateur) : créer un compte Resend,
vérifier le domaine `assiettly.fr` (DNS DKIM/SPF fournis par Resend), et
renseigner `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `CRON_SECRET` sur Vercel.

## Notifications push (Web Push)

Deuxième canal de rappel, en plus de l'e-mail, avec consentement explicite
recueilli à l'onboarding (dernière étape, optionnelle — ne bloque jamais la
suite du parcours si l'utilisateur refuse ou ferme la popup du navigateur).

- **VAPID** : paire de clés générée une fois (`web-push generate-vapid-keys`)
  — `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (exposée au navigateur) et
  `VAPID_PRIVATE_KEY` (jamais exposée, signe les envois côté serveur).
- `apps/web/public/sw.js` : service worker minimal (écoute `push` et
  `notificationclick`, ouvre `/journal/ajouter` au clic).
- `apps/web/public/icon-flamme-192.png` : icône de notification, rendue à
  partir du SVG de marque (`FlammeIcon`) pour rester cohérent visuellement.
- `apps/web/src/lib/pushClient.ts` : côté navigateur, demande la permission
  (`Notification.requestPermission`) et crée l'abonnement
  (`PushManager.subscribe`).
- `apps/web/src/server/actions/push.ts` : stocke/supprime l'abonnement
  (table `push_subscriptions`, une ligne par appareil/navigateur).
- `apps/web/src/lib/webpush.ts` : client `web-push` côté serveur, signé
  avec les clés VAPID.
- Le cron `streak-reminders` envoie désormais **e-mail ET push** à chaque
  profil concerné ; les abonnements expirés/révoqués (erreurs 404/410 de
  `web-push`) sont automatiquement supprimés de la base.
- `apps/web/src/components/NotificationsToggle.tsx` (page Profil) : permet
  d'activer/désactiver après coup, pas seulement à l'onboarding.

À faire côté utilisateur : renseigner `NEXT_PUBLIC_VAPID_PUBLIC_KEY`,
`VAPID_PRIVATE_KEY` et `VAPID_SUBJECT` sur Vercel (mêmes valeurs qu'en
local, à ne jamais régénérer une fois des utilisateurs abonnés — ça
invaliderait tous les abonnements existants).

## Refonte de l'onboarding (13 écrans + calcul final animé)

L'onboarding a été entièrement réécrit pour suivre un parcours en 13 étapes
séparées (une question par écran, façon app fitness grand public), plus un
écran final de calcul animé.

**Nouvelles données collectées** (en plus de sexe/date de naissance/taille/
poids/niveau d'activité/objectif/poids cible déjà existants) :
- `dejaUtiliseAppSuivi` (bool) : a déjà utilisé une app de suivi nutritionnel
- `suiviParCoach` (bool) : accompagné par un coach/diététicien
- `freins` (tableau, multi-sélection) : ce qui freine habituellement
  (régularité, temps, inspiration, envies sucrées, repas sociaux, soutien)
- `typeAlimentation` : équilibré / végétarien / végan / pescetarien / flexitarien
- `motivationPrincipale` : mieux manger / plus d'énergie / rester motivé /
  bien dans son corps

**Décisions produit validées avec l'utilisateur** :
- Écran "sexe" étendu à 3 options (Femme / Homme / Autre). Pas de formule
  Mifflin-St Jeor dédiée à un 3ᵉ sexe : pour `AUTRE`, on applique la moyenne
  des deux ajustements existants (+5 / −161) — voir le commentaire dans
  `calculerBMR` (`packages/shared/src/nutrition.ts`).
- Les questions de fréquence d'activité ont été **fusionnées en 3 cartes**
  simples (peu actif / modérément actif / très actif) plutôt qu'un curseur
  numérique — les valeurs d'enum `LEGER`/`ACTIF` restent valides en base
  (profils existants, calculs) mais ne sont plus atteignables depuis ce
  nouvel onboarding.
- Sélecteurs numériques (taille, poids, poids cible, date de naissance) :
  vrai **picker à molette** (scroll-snap CSS natif, sans librairie) plutôt
  qu'un champ numérique stylé — `MoletteValeur`/`MoletteValeurGenerique`
  dans `src/components/onboarding/primitives/`.
- **Unités cm/kg uniquement** (pas d'option impérial ft/in ou lbs), le
  marché visé étant francophone.
- L'ancien écran de "projection de date d'objectif" a été retiré du
  parcours au profit d'un écran final unique qui anime un pourcentage
  0→100 (2,2 s) tout en révélant progressivement les résultats **réels**
  (`calculerObjectifs`, pas une animation factice) : calories, glucides,
  protéines, lipides, "score santé".

**Structure des fichiers** (`apps/web/src/components/onboarding/`) :
- `types.ts` : `ProfilOnboarding`, état initial, `EtapeProps` générique
- `primitives/` : `CarteChoix`, `ChoixOuiNon`, `MoletteValeur`,
  `MoletteValeurGenerique`, `SelectDateNaissance` (3 molettes jour/mois/
  année), `EncartAvertissement`
- `etapes/` : un fichier par écran (`EtapeSexe`, `EtapeDateNaissance`,
  `EtapeActivite`, `EtapeTaille`, `EtapePoidsActuel`, `EtapeAppSuivi`,
  `EtapeCoach`, `EtapeObjectif`, `EtapeFreins`, `EtapePoidsCible` (avec
  avertissement doux si hors fourchette de poids santé via
  `calculerFourchettePoidsSain`), `EtapeAlimentation`, `EtapeMotivation`,
  `EtapeNotifications` (consentement push, reprise de la fonctionnalité
  existante), `EtapeCalculFinal`
- `OnboardingWizard.tsx` : orchestrateur (config déclarative des étapes,
  barre de progression, bouton précédent, validation "peut continuer" par
  étape) ; appelle `terminerOnboarding` (Server Action) une seule fois à la
  toute fin, sur l'écran de calcul.

Vérifié avec `pnpm typecheck` (packages/shared + apps/web) et `pnpm build`
(apps/web) — aucune erreur.

**Migration Supabase à appliquer** (SQL Editor du dashboard Supabase) — deux
migrations Prisma générées localement pour ce changement de schéma, à
exécuter dans cet ordre :

```sql
-- 1) add_onboarding_survey_fields
CREATE TYPE "TypeAlimentation" AS ENUM ('EQUILIBRE', 'VEGETARIEN', 'VEGAN', 'PESCETARIEN', 'FLEXITARIEN');
CREATE TYPE "MotivationPrincipale" AS ENUM ('MIEUX_MANGER', 'PLUS_ENERGIE', 'RESTER_MOTIVE', 'BIEN_DANS_SON_CORPS');
ALTER TABLE "profiles" ADD COLUMN     "deja_utilise_app_suivi" BOOLEAN,
ADD COLUMN     "freins" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "motivation_principale" "MotivationPrincipale",
ADD COLUMN     "suivi_par_coach" BOOLEAN,
ADD COLUMN     "type_alimentation" "TypeAlimentation";

-- 2) add_sexe_autre
ALTER TYPE "Sexe" ADD VALUE 'AUTRE';
```

## Dashboard principal (accueil, détail nutritionnel, progrès, scan, groupes)

Refonte des écrans post-onboarding autour d'une navigation par barre basse
(façon app fitness grand public), avec le dashboard calorique et le détail
nutritionnel comme cœur de l'usage quotidien.

**Structure des composants** (`apps/web/src/components/dashboard/`) :
- `primitives/` : `AnneauCirculaire` (anneau SVG générique — valeur, max,
  dégradé ou couleur pleine, taille, épaisseur, contenu central — remplace
  l'ancien `AnneauProgression`, qui n'était qu'un cas d'usage figé de ce
  composant), `PaginationPoints` (points de pagination génériques),
  `EtatVide` (état vide réutilisable : icône, message, CTA optionnel)
- `BarreNavigation.tsx` + `MenuActionRapide.tsx` : barre basse à 4 onglets
  (Accueil / Progrès / Groupes / Profil) et bouton "+" flottant central
  ouvrant une feuille d'action (Scanner / Code-barres / Recherche manuelle /
  Saisie manuelle) — ces trois derniers renvoient vers le flux d'ajout
  existant (`AjouterRepasForm`, déjà capable de recherche + code-barres +
  quantité), seul "Scanner" ouvre le nouvel écran caméra
- `SelecteurJoursSemaine.tsx`, `CarteCaloriesJour.tsx`, `CarteMacro.tsx`,
  `CartesMacroPaginees.tsx`, `CarteRepasRecent.tsx` : composants du dashboard
  d'accueil
- `AjusteurQuantiteRepas.tsx`, `BoutonPartager.tsx`, `MenuRepas.tsx` :
  composants de l'écran de détail nutritionnel
- `progres/` : `CartePoidsActuel`, `CarteSerieProgres`,
  `GraphiqueEvolutionPoids`, `MessageEncouragement`, `CarteMoyenneCalories`,
  `CalendrierMensuel` (extrait de l'ancien écran calendrier, désormais
  réutilisable)
- `scan/EcranScanMock.tsx`, `social/FluxGroupesMock.tsx` : aperçus non
  connectés (voir plus bas)

**Routes** : `/accueil` (refonte), `/repas/[id]` (nouveau détail
nutritionnel), `/progres` (nouvel écran unifié poids + série + calendrier —
`/poids` et `/streaks/calendrier` deviennent de simples redirections vers
`/progres` pour ne pas casser de liens existants), `/scanner` (plein écran,
hors du groupe de layout `(app)` pour ne pas afficher header/nav par-dessus
la caméra), `/groupes` (nouvel onglet, V2).

**Données réelles, pas statiques** : toutes les valeurs affichées viennent de
Prisma, calculées à la demande dans `src/server/actions/meals.ts` :
- `obtenirSemaineDashboard()` : calories consommées par jour sur la semaine
  calendaire (lundi → dimanche) contenant aujourd'hui, pour les mini-anneaux
  du sélecteur de jours
- `obtenirRepasParId()` / `ajusterQuantiteRepas()` : détail d'un repas et
  ajustement de portion — la quantité et les valeurs nutritionnelles de
  chaque aliment sont redistribuées proportionnellement (le ratio
  valeur/grammage de chaque aliment reste constant), donc l'opération reste
  stable même appliquée plusieurs fois de suite ; l'ajustement redéclenche
  `recomputerStreakPourJour` (la flamme du jour peut changer si la nouvelle
  quantité sort de la fourchette ±10%)
- `obtenirTendanceCalories()` : moyenne calorique sur 7 jours vs les 7 jours
  précédents, pour la flèche de tendance de l'écran Progrès

**Heuristiques documentées** (pas des calculs médicaux) :
- "Score santé" (carte macro, 2ᵉ page du dashboard) = moyenne des trois
  ratios macro du jour (protéines/glucides/lipides), chacun plafonné à
  100 %, exprimée sur 100
- Objectif "Fibres" fixé à 25 g/jour (repère visuel générique, pas
  personnalisé par profil)
- Message d'encouragement de l'écran Progrès : compare le poids sur les 5
  dernières pesées à la direction attendue par l'objectif (perte/prise/
  maintien) pour choisir un message parmi 4, toujours formulé positivement
  — jamais un diagnostic

**Écran de détail nutritionnel** : la photo réelle n'existe pas encore (pas
de scan IA), remplacée par un bloc dégradé corail→ambre avec une icône —
sera branché sur la vraie photo capturée à l'intégration de l'IA vision. Le
bouton "Corriger" (IA) est désactivé avec une infobulle "bientôt
disponible" pour la même raison. Le bouton de partage utilise l'API Web
Share native quand disponible, sans fallback forcé.

**Scan caméra (`/scanner`) et flux social (`/groupes`) — aperçus non
connectés**, comme demandé : l'architecture est en place mais les données
sont simulées, clairement présentées comme telles à l'écran ("Aperçu",
"arrive bientôt") plutôt que déguisées en fonctionnalité réelle.
- Le scan simule une capture puis fait apparaître progressivement des
  bulles d'ingrédients reliées par un trait fin à un point du plat (SVG en
  superposition), dans l'esprit demandé, avant de renvoyer vers l'ajout
  manuel — la vraie détection (API Claude vision) reste à intégrer.
- Le flux social affiche un bandeau "aperçu" permanent, des membres/posts de
  démonstration (noms génériques, pas de vraies personnes), et tous les
  boutons d'interaction (réagir, commenter, changer de groupe) sont
  désactivés — à remplacer par de vraies données/actions quand les groupes
  seront implémentés (création, invitations, réactions persistées).

**Vérification** : `pnpm typecheck` (web) et `pnpm build` passent sans
erreur. Les écrans ont été testés dans un navigateur piloté automatiquement
avec des données de démonstration (profil, repas, pesées, série) créées
temporairement en base locale via un court-circuit d'authentification
retiré avant le commit (même méthode que documentée plus haut pour
l'onboarding) — anneau calorique, sous-cartes macro paginées, réglage de
portion (recalcul immédiat des calories et de la flamme du jour), écran
Progrès (poids, série, graphique, calendrier), menu d'action rapide et
démo du scan ont tous été vérifiés visuellement.

## Landing page publique et authentification

Avant, `/` redirigeait un visiteur non connecté vers un écran minimal
("Assiettly" + un CTA). Il y a maintenant une vraie landing marketing
publique, avec inscription/connexion étendues (OAuth, mot de passe oublié).

**Routing** : pas de renommage sous `/app/*` — la structure plate existante
(`/accueil`, `/progres`, etc.) sert déjà de zone applicative, et le
middleware protège tout par défaut sauf une liste blanche explicite de
routes publiques (`/`, `/connexion`, `/inscription`,
`/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`, `/auth/callback`,
les 3 pages légales, `/api/webhooks`). Un visiteur non connecté sur une
route protégée est redirigé vers `/connexion` (comportement déjà en place,
inchangé). Un utilisateur connecté qui arrive sur `/` est automatiquement
redirigé vers `/accueil` (vérification de session côté serveur, avant tout
rendu de la landing).

**Structure de la landing** (`apps/web/src/components/landing/`) :
`HeaderLanding` (+ `MenuMobile`, seul îlot client de la page, pour le menu
hamburger), `Hero` (+ `MockupDashboard`), `Fonctionnalites`, `SocialProof`,
`Tarifs`, `FooterLanding` — assemblés dans `src/app/page.tsx`, qui reste un
Server Component (le check de session + redirect utilise le client Supabase
serveur, comme avant).

**Choix de différenciation du hero** : titre qui tranche sur la cuisine
française reconnue nativement ("Le seul suivi alimentaire qui reconnaît
vraiment la cuisine française"), sous-titre qui appuie sur la mécanique de
la flamme pour la rétention — les deux angles proposés dans le brief,
combinés plutôt que choisis, sans repartir sur un titre générique de
catégorie ("Suivez votre alimentation").

**Visuel du hero** : `MockupDashboard` est un composant SVG/CSS pur (anneau
calorique + badge flamme + barres macro, mêmes composants visuels que le
vrai dashboard) plutôt qu'une image — zéro poids réseau, dimensions
explicites, aucun décalage de mise en page au chargement. Ça règle
directement l'exigence de performance sur le hero sans avoir à produire et
optimiser un fichier WebP/AVIF.

**Réassurance (`SocialProof`)** : pas de faux chiffres/témoignages. Un
chiffre inventé "à remplacer plus tard" reste presque toujours en prod, ce
qui est un vrai risque de confiance et de conformité (publicité
mensongère) une fois l'app publique. En attendant de vraies données, le
composant affiche deux réassurances factuelles et vérifiables dès
aujourd'hui : hébergement des données en UE (le projet Supabase tourne déjà
en `eu-west-3`, Paris — donc l'affirmation est vraie, pas une promesse en
l'air) et le positionnement "cuisine française" (vérifiable sur la base
alimentaire elle-même). Le composant a un flag interne
(`AFFICHER_CHIFFRES_REELS`) et des tableaux `STATS`/`TEMOIGNAGES` vides :
le jour où de vraies données existent, il suffit de les remplir et de
passer le flag à `true` — le même gabarit visuel (`CarteReassurance`) est
réutilisé dans les deux cas, donc rien à redessiner.

**Tarifs** : mêmes chiffres que `/paywall` (0€ / 6,99€ mois / 49,99€ an,
mêmes avantages Premium) pour ne pas avoir deux sources de vérité sur le
prix. Les deux CTA renvoient vers `/inscription`, jamais vers un paiement
direct — le paywall n'intervient qu'après l'onboarding complet, une fois
que la personne a vu le calcul personnalisé de ses besoins, jamais avant
d'avoir créé un compte.

**Footer** : liens légaux (mentions légales, CGU, confidentialité) vers des
pages stub honnêtes ("cette page sera complétée avant le lancement public")
plutôt que du texte juridique inventé — un vrai CGU/mentions légales doit
être rédigé par quelqu'un de qualifié, pas généré. Pas de liens réseaux
sociaux : Assiettly n'a pas encore de comptes Instagram/TikTok confirmés,
et fabriquer des liens vers des comptes qui n'existent peut-être pas serait
pire qu'une section absente.

**Inscription / connexion** : ajout des boutons "Continuer avec
Google/Apple" (`supabase.auth.signInWithOAuth`, composant partagé
`BoutonsOAuth`) sur les deux écrans, lien "Mot de passe oublié" sur
`/connexion`, micro-texte "Sans carte bancaire · Prêt en 2 minutes" sur
l'inscription. Nouveau point d'échange `src/app/auth/callback/route.ts` :
un seul `route.ts` gère l'échange de code pour l'OAuth Google/Apple *et*
pour les liens "mot de passe oublié"/confirmation d'e-mail Supabase (tous
utilisent le même mécanisme PKCE `exchangeCodeForSession`), avec un
paramètre `next` pour rediriger au bon endroit ensuite.

**Mot de passe oublié** : `/mot-de-passe-oublie` (demande de lien) →
e-mail Supabase (déjà avec le template de marque créé précédemment) →
`/auth/callback?next=/reinitialiser-mot-de-passe` → `/reinitialiser-mot-de-passe`
(nouveau mot de passe via `supabase.auth.updateUser`).

**Redirection post-authentification** : la logique "onboarding non terminé
→ questionnaire, sinon → dashboard" existait déjà dans `(app)/layout.tsx`
(vérifie `profile.onboardingTermine`) — connexion et inscription (avec
session immédiate) poussent simplement vers `/accueil`/`/onboarding` et ce
layout fait le reste, pas de logique dupliquée à écrire.

**À faire côté Supabase avant que les boutons Google/Apple fonctionnent
réellement** : les fournisseurs OAuth Google et Apple ne sont pas encore
activés dans le dashboard Supabase (Authentication → Providers) — sans ça,
cliquer sur ces boutons renverra une erreur "provider not enabled" (gérée
proprement, affichée à l'utilisateur, pas de crash). Il faudra créer les
identifiants OAuth (Google Cloud Console / Apple Developer) et les
renseigner dans Supabase avant le lancement public.

**Vérification** : `pnpm typecheck` + `pnpm build` propres. Landing testée
visuellement en mobile (400px) et desktop (1280px) : hero, 4 blocs
fonctionnalités, réassurance, tarifs, footer, menu mobile ; écrans
connexion/inscription/mot de passe oublié avec les boutons OAuth.

## Landing : "Comment ça fonctionne", comparatif et FAQ

Trois sections ajoutées à la landing suite à une version étendue du brief
marketing, entre le Hero et le footer (ordre final : Hero → Comment ça
fonctionne → Fonctionnalités → Comparatif → Tarifs → FAQ → Footer).

- **`CommentCaFonctionne.tsx`** (`#comment-ca-marche`, juste après le
  Hero) : 4 étapes numérotées dans l'ordre réel d'usage (photo → analyse IA
  → flamme → suivi de progrès). Le CTA secondaire du Hero ("Voir comment ça
  marche") pointe maintenant précisément vers cette ancre plutôt que vers
  la section fonctionnalités.
- **`Comparatif.tsx`** : remplace le composant `SocialProof` de la version
  précédente (supprimé — son contenu de réassurance RGPD/UE se retrouve
  dans le tableau). Tableau "Assiettly vs apps généralistes" : 4 critères,
  chacun vrai et vérifiable côté Assiettly (hébergement UE confirmé sur
  Supabase en `eu-west-3`, base alimentaire et interface pensées pour la
  France, mécanique de flamme réellement implémentée). Aucun concurrent
  n'est nommé, et la colonne "apps généralistes" reste volontairement
  nuancée ("souvent partielle", "variable", "à vérifier") plutôt que des ❌
  catégoriques sur des produits qu'on ne peut pas garantir dans le temps.
  **Point d'attention** : la publicité comparative est encadrée en France
  (Code de la consommation — exactitude, vérifiabilité, absence de
  caractère trompeur) même sans nommer de marque précise ; ce tableau
  devrait être relu avant un lancement public, et toute ligne ajoutée par
  la suite doit rester strictement vérifiable au moment de la publication.
- **`Faq.tsx`** (`#faq`) : accordéon en `<details>/<summary>` natifs — zéro
  JavaScript, donc aucun impact sur la performance (contrainte du brief).
  6 questions honnêtes : précision du scan (IA, ajustement manuel possible,
  pas de taux de précision inventé), différence gratuit/Premium, mécanique
  de la flamme et des freezes (±10 %, 2 freezes/mois — valeurs réelles du
  code, pas des chiffres marketing), sécurité des données, résiliation à
  tout moment, disponibilité mobile. Sur ce dernier point, réponse fidèle à
  l'architecture réelle du produit : Assiettly est une web app responsive
  (pas d'app native App Store/Play Store), ajoutable à l'écran d'accueil —
  pas de faux "disponible sur iOS et Android" qui laisserait croire à des
  apps natives.
- Header et menu mobile mis à jour avec l'ancre `#faq`.

## Analyse nutritionnelle par photo (API Claude)

Implémentation du cœur technique du scan de repas : appel à l'API Claude
(vision + structured outputs) pour identifier les aliments d'une photo et
estimer leurs valeurs nutritionnelles, avec un niveau de confiance par
ingrédient et global.

**Vérification de la doc à jour avant d'écrire le code** (comme demandé) :
`output_config.format` (type `json_schema`) est bien le paramètre actuel —
l'ancien `output_format` est déprécié. Le schéma JSON doit avoir
`additionalProperties: false` sur chaque objet. Le SDK TypeScript
(`@anthropic-ai/sdk`, dernière version 0.125.0, installée) type nativement
`output_config` et liste `claude-sonnet-4-5-20250929` parmi les modèles
supportés. Vérifié aussi que l'image doit être placée avant le texte dans
le message pour de meilleurs résultats (recommandation officielle),
appliqué dans `analyserRepas.ts`.

**Choix du modèle** : `claude-sonnet-4-5-20250929` (snapshot daté, jamais un
alias non versionné en prod), isolé dans une seule constante
(`MODELE_ANALYSE` dans `analyserRepas.ts`) pour pouvoir basculer facilement
vers `claude-opus-4-5-20251101` si la précision doit primer sur le coût, ou
vers la génération actuelle (`claude-sonnet-5`/`claude-opus-5`, également
supportée par structured outputs) une fois évaluée en conditions réelles.

**Structure du module** (`apps/web/src/server/foodAnalysis/`) :
- `prompt.ts` : `FOOD_ANALYSIS_SYSTEM_PROMPT`, isolé pour pouvoir l'itérer
  sans toucher au code d'appel
- `schema.ts` : `ANALYSE_REPAS_JSON_SCHEMA` (passé à `output_config.format`)
  et son miroir zod (`analyseRepasSchema`) qui valide la réponse à
  l'exécution en défense en profondeur, même si structured outputs garantit
  déjà la conformité — plus les types TS dérivés. Étendu par rapport au
  schéma du brief avec `quantite_estimee_g` (nombre) en plus de
  `quantite_estimee` (texte) : indispensable pour calculer les totaux et
  ajuster les portions côté app, un texte libre ne suffit pas
- `errors.ts` : `ErreurAnalyseImage`, `ErreurQuotaAnthropic`,
  `ErreurReponseInvalide`, `ErreurTimeoutAnalyse`
- `cache.ts` : dédup légère en mémoire par hash sha256 de l'image (TTL
  5 min) — **best-effort seulement** : en serverless (Vercel), chaque
  instance a sa propre mémoire et peut être recyclée, donc ça réduit les
  doublons évidents (double-tap) mais n'est pas une garantie à l'échelle ;
  un store partagé (Redis/Vercel KV) serait nécessaire pour une vraie
  dédup, pas encore en place
- `analyserRepas.ts` : construit le message (image en base64 + prompt
  système + `output_config`), appelle l'API avec un timeout de 25 s,
  parse/valide la réponse, journalise l'appel, mappe les erreurs SDK
  (`RateLimitError` → quota, `APIConnectionTimeoutError` → timeout,
  `BadRequestError` → image invalide) vers les erreurs typées ci-dessus

**Journalisation** (`FoodAnalysisLog`, nouveau modèle Prisma) : modèle
utilisé, confiance globale, nombre d'ingrédients, durée, erreur éventuelle
— **jamais l'image elle-même**, conformément aux contraintes RGPD déjà
posées pour l'app. Sert à repérer plus tard les cas où la confiance est
fréquemment basse pour ajuster le prompt système.

**Server Action** (`src/server/actions/scan.ts`) : `analyserPhoto()` vérifie
l'authentification, le type MIME (jpeg/png/webp) et la taille (8 Mo max
décodés) avant d'appeler le module — évite de payer un appel API pour une
requête manifestement invalide.

**Écran de scan** (`EcranScan.tsx`, remplace l'ancien `EcranScanMock`) :
capture réelle via `<input type="file" accept="image/*" capture="environment">`
(fonctionne nativement sur mobile, plus simple et plus fiable qu'une
implémentation `getUserMedia` custom pour un premier lancement), état de
chargement pendant l'appel réel, écran de résultat avec badge de confiance
par ingrédient et global, bannière explicite si la confiance globale est
"basse" ("vérifie et corrige les quantités avant de valider"), bouton
"Corriger" qui rend les quantités éditables (recalcul des macros en direct
à partir du taux par gramme), bouton "Terminé" qui persiste via l'action
`ajouterRepas` déjà existante (pas de nouvelle logique de persistance) et
redirige vers le dashboard. Code-barres et étiquette restent des
placeholders "bientôt disponibles" (l'IA vision ne couvre que le scan
photo pour l'instant).

**Tests effectués** : `pnpm typecheck` et `pnpm build` propres. La requête
a été vérifiée en conditions réelles contre l'API (réseau sortant testé,
corps de requête accepté — rejeté seulement sur l'authentification, pas
sur le format) car **aucune clé Anthropic réelle n'est configurée dans cet
environnement** (`.env` contient encore `sk-ant-placeholder`). Aucune
analyse réelle sur une vraie photo n'a donc pu être testée de bout en
bout — à faire côté utilisateur avec une clé valide avant la mise en
production, notamment pour évaluer si Sonnet 4.5 suffit en précision ou
si Opus 4.5 est nécessaire sur les plats composites (quiches, lasagnes,
plats en sauce).

**Migration Supabase à appliquer** (SQL Editor du dashboard) :

```sql
CREATE TABLE "food_analysis_logs" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "modele" TEXT NOT NULL,
    "confiance_globale" TEXT,
    "nombre_ingredients" INTEGER NOT NULL DEFAULT 0,
    "duree_ms" INTEGER NOT NULL,
    "erreur" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_analysis_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "food_analysis_logs_profile_id_idx" ON "food_analysis_logs"("profile_id");

ALTER TABLE "food_analysis_logs" ADD CONSTRAINT "food_analysis_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Audit et corrections mobile-first

Passage systématique de tout ce qui existait (onboarding, dashboard,
landing/auth) au crible des principes mobile-first du brief. La landing
reste la seule zone où le desktop compte un minimum ; partout ailleurs
(onboarding, dashboard, scan, progrès), le desktop n'est qu'un "ça marche
quand même" — aucun temps passé sur des breakpoints desktop dédiés pour ces
écrans-là, conformément à la consigne.

**Viewport et zones sûres, posés une fois dans le layout de base** :
- `export const viewport` dans `app/layout.tsx` : `viewportFit: "cover"`
  (indispensable pour que les `env(safe-area-inset-*)` renvoient de vraies
  valeurs sur encoche/Dynamic Island/barre de gestes, sinon ils valent 0),
  pas de `maximumScale`/`userScalable: false` — le pinch-to-zoom n'est
  jamais désactivé (accessibilité), le zoom *involontaire* est évité
  autrement (voir plus bas)
- `globals.css` : `input, select, textarea { font-size: 16px }` en filet de
  sécurité — c'est un texte sous 16px dans un champ qui déclenche le zoom
  automatique de Safari iOS au focus, pas un réglage de viewport
- Classes utilitaires `.safe-top`/`.safe-bottom`/`.safe-left`/`.safe-right`
  dans `globals.css`, avec un avertissement explicite en commentaire : ne
  jamais les combiner avec une classe Tailwind qui pose le même padding sur
  le même élément (l'une écraserait l'autre selon l'ordre du CSS généré,
  piège rencontré et corrigé pendant cet audit sur `MenuActionRapide`) —
  dans ce cas, utiliser une valeur arbitraire du type
  `pb-[calc(2rem+env(safe-area-inset-bottom))]` à la place

**Bug réel trouvé et corrigé** : `BarreNavigation` (barre basse fixe,
ajoutée lors du prompt dashboard) et la barre "Valider le repas" fixe de
`AjouterRepasForm` (écran plus ancien) étaient toutes les deux
`fixed inset-x-0 bottom-0` sur `/journal/ajouter` — la seconde se
retrouvait entièrement masquée par la première, CTA principal inatteignable.
Corrigé en positionnant la barre "Valider" au-dessus de la nav
(`bottom-[calc(64px+env(safe-area-inset-bottom))]`) plutôt qu'au ras de
l'écran. Repéré uniquement grâce à une capture d'écran à 320px — un bon
rappel de pourquoi ce prompt demandait de tester à cette largeur avant de
considérer un écran terminé.

**Autre bug réel trouvé et corrigé** : le champ code-barres de
`AjouterRepasForm` (`flex-1` sans `min-w-0` dans une rangée flex) poussait
le bouton "OK" hors de l'écran à 320px — bug classique de Flexbox (un
enfant flex ne rétrécit jamais sous la largeur de son contenu sans
`min-w-0`). Corrigé, et vérifié qu'aucun autre `flex-1`/`truncate` du code
n'avait le même problème (déjà correct ailleurs : `CarteRepasRecent`,
`EcranScan`).

**Onboarding — le bouton "Continuer" ne peut plus sortir de l'écran** :
plutôt que de retoucher l'espacement de chacun des 13 écrans au cas par
cas (fragile, à refaire à chaque nouvel écran), `OnboardingWizard.tsx` est
restructuré une fois pour toutes : conteneur `h-[100dvh]` (hauteur de
viewport dynamique — évite le bug classique `100vh` qui inclut la barre
d'adresse mobile), header et bouton "Continuer" en `shrink-0`, seule la
zone de contenu de l'étape est `flex-1 overflow-y-auto`. Résultat : le
bouton reste **toujours visible**, quelle que soit la hauteur du contenu —
c'est une garantie structurelle (CSS), pas un réglage à vérifier écran par
écran. Vérifié à 320px et 375px sur les écrans Sexe et Date de naissance
(hauteur réduite à 600px, proche d'un iPhone SE) : aucun débordement.

**Zones tactiles ≥44×44px** (recommandation Apple/Android) : tous les
boutons icône seuls qui faisaient 36px (`h-9 w-9`) sont passés à 44px
(`h-11 w-11`) — bouton retour de l'onboarding, menu hamburger de la
landing, partager/options/retour de l'écran de détail, +/- de l'ajusteur
de portion, fermer/réessayer du scan. Les points de pagination
(`PaginationPoints`) gardent un visuel de point fin, mais la zone cliquable
réelle du bouton est maintenant 44×44px (centrage flex autour du point,
pas la taille du point elle-même). Compromis assumé et documenté sur deux
contrôles secondaires à faible fréquence d'usage : le sélecteur de période
du graphique de poids (36px, 4 pastilles denses dans une carte) et les
points du graphique lui-même — corrigés autrement (voir plus bas).

**Cas pratique du principe "pas de hover-only"** : audit du code (aucune
info/action cachée derrière un `:hover` seul trouvée — tous les usages de
`hover:` sont des embellissements décoratifs sur des éléments déjà
cliquables au tap). Le cas le plus concret restait le graphique
d'évolution du poids : les points du tracé faisaient quelques pixels de
rayon et réagissaient à `onMouseEnter`, illisible/impossible à toucher
précisément au doigt. Plutôt que d'agrandir chaque point (ils se
chevaucheraient sur un tracé dense), toute la largeur du graphique sert
maintenant de zone tactile façon curseur : `onPointerDown`/`onPointerMove`
calculent le point le plus proche de l'endroit touché — fonctionne aussi
bien au doigt qu'à la souris, sans code spécifique tactile.

**Scan caméra** : écran plein écran (`fixed inset-0`) avec zones sûres en
haut (bouton fermer sous l'encoche/Dynamic Island) et en bas (déclencheur
au-dessus de la barre de gestes). Le déclencheur (64px) reste centré en
bas, atteignable au pouce à une main quelle que soit la main, comme
demandé.

**Clavier virtuel** : tous les champs de saisie sont à 16px (filet de
sécurité global ci-dessus), donc aucun ne devrait déclencher de zoom
involontaire au focus. Le défilement automatique d'un champ focus dans la
zone visible est un comportement natif du navigateur (aucune app ne le
désactive ici). **Limite honnête** : le comportement réel du clavier
virtuel iOS/Android face aux barres fixes (est-ce qu'il les repousse
proprement au-dessus du clavier ou les laisse-t-il masquées ?) n'a pas pu
être testé dans ce sandbox, qui n'a pas de clavier tactile réel — à confier
à un test sur téléphone physique avant lancement, en particulier sur
`/journal/ajouter` (recherche d'aliment + deux barres fixes empilées).

**Gestes natifs (swipe, pull-to-refresh)** : non implémentés
délibérément. Le pull-to-refresh natif du navigateur (au sommet du scroll)
n'est bloqué nulle part dans le code, donc il fonctionne déjà par défaut
sans rien coder. Le swipe personnalisé entre jours du dashboard ou entre
photos avant/après n'existe pas encore — le brief le qualifiait lui-même
de "si pertinent"/"si la stack le permet nativement" ; vu l'ampleur déjà
couverte par cet audit, ce point est noté comme amélioration future plutôt
que traité maintenant.

**Arbitrages desktop assumés** (documentés comme demandé, aucun retravaillé
pour le desktop) :
- Les 4 onglets + bouton central de `BarreNavigation` restent en une seule
  rangée sur grand écran (pas de sidebar) — cohérent avec la consigne
  explicite de ne pas construire de patterns "grand écran d'abord"
- Le sélecteur de période du graphique de poids et le point de pagination
  restent sous 44px — compromis assumé plutôt que de dégrader le visuel
  d'un contrôle secondaire à faible fréquence
- Le tableau comparatif et les cartes tarifs de la landing utilisent des
  grilles qui s'élargissent sur desktop (`sm:`/`lg:`) — seule concession
  desktop du projet, volontaire et scoping-limitée à la landing comme
  prévu par le brief

**Vérification** : `pnpm typecheck` + `pnpm build` propres. Testé
visuellement à 375px et 320px (viewport réduit à 600-700px de haut pour
simuler un iPhone SE) sur : onboarding (Sexe, Date de naissance),
dashboard d'accueil, écran de scan, ajout de repas (avant/après le fix du
bug de débordement), détail nutritionnel, écran Progrès.

## PWA installable + écran d'installation en fin d'onboarding

Assiettly devient une Progressive Web App installable, avec un écran dédié
en fin d'onboarding qui encourage — sans jamais l'imposer — l'ajout à
l'écran d'accueil.

**Manifest** (`public/manifest.webmanifest`) : `name`/`short_name`
"Assiettly", `display: "standalone"`, `theme_color` corail `#F2603C`
(barre de statut une fois l'app ouverte), `background_color` crème
`#FBF4EC` (splash screen au lancement), `start_url: "/"` — qui gère déjà
tout seul la redirection selon l'état de connexion (`/` redirige vers
`/accueil` si connecté, sinon montre la landing, logique déjà en place).
Icônes 192×192 et 512×512 + apple-touch-icon 180×180, générées à partir du
SVG de marque (`FlammeIcon`) sur fond crème plutôt que dessinées à la main
— cohérence garantie avec le reste de l'identité visuelle.

**Balises iOS** (`app/layout.tsx`, via l'API `Metadata`/`Viewport` de
Next.js — pas de balises manuelles) : `apple-mobile-web-app-capable`,
`apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`,
`apple-touch-icon`. Le `theme-color` de la page elle-même est aussi passé
en corail (il était en crème depuis le prompt mobile-first) pour rester
cohérent avec le `theme_color` du manifest.

**Bug réel trouvé et corrigé** : le middleware protège tout par défaut
sauf sa liste blanche de routes publiques — `/manifest.webmanifest` et
`/sw.js` n'y étaient pas, donc un visiteur non connecté qui les demandait
(ce que fait le navigateur pour juger l'installabilité, sans session) se
faisait rediriger vers `/connexion`, cassant le manifest et le service
worker. Corrigé en excluant ces fichiers (et `/icons/`) du matcher du
middleware, au même titre que les fichiers statiques déjà exclus, plutôt
qu'en les ajoutant à la liste blanche — plus robuste, cohérent avec le
traitement des autres assets publics.

**Service worker** (`public/sw.js`, déjà existant pour le push, étendu) :
`install` pré-cache un petit shell (manifest, icônes) et `fetch` applique
network-first sur la navigation (toujours le contenu à jour, secours cache
seulement hors-ligne) et cache-first sur les assets statiques versionnés
(`_next/static`, icônes). Pas d'objectif offline-first — le scan photo et
le calcul nutritionnel nécessitent une connexion à l'API Claude, comme
prévu — l'objectif est la vitesse de chargement et l'installabilité.

**Capture de `beforeinstallprompt`** (`src/lib/pwaInstallPrompt.ts`) :
contrainte du navigateur oblige, l'événement n'est envoyé qu'une fois et
tôt dans le cycle de vie de la page, donc son écoute démarre dès
`app/layout.tsx` (composant `PwaInit`, monté sur toutes les pages) plutôt
qu'à l'écran d'installation — sinon l'événement serait déjà passé le temps
que l'utilisateur atteigne la fin de l'onboarding. Stocké dans un module
singleton avec un mécanisme d'abonnement pour que l'écran d'installation
et le profil réagissent à sa disponibilité (ou à son absence, ex. app déjà
installée) sans prop-drilling.

**Détection de plateforme** (`src/lib/detectionPlateforme.ts`) : par user
agent — il n'existe pas d'API de feature-detection fiable pour distinguer
iOS/Android/desktop. Gère le cas iPadOS 13+, qui se présente comme un Mac
(détecté via `maxTouchPoints > 1` combiné à "Macintosh" dans l'UA).
`estDejaInstallee()` combine `display-mode: standalone` (Android/Chrome)
et `navigator.standalone` (propriété historique, plus fiable sur Safari
iOS).

**Écran d'installation** (`EtapeInstallation.tsx`, positionné juste après
l'écran de calcul final, avant le paywall et le premier accès au
dashboard) :
- Mockup d'écran d'accueil de téléphone en SVG/CSS pur (même logique que
  les mockups de la landing) avec l'icône Assiettly parmi des icônes
  génériques
- Se saute automatiquement si l'app tourne déjà en mode standalone
  (nouveau compte sur un téléphone qui a déjà installé Assiettly) — aucun
  flash de contenu, la vérification se fait avant le premier rendu utile
- **Android** : bouton "Ajouter à l'écran d'accueil" si le prompt est
  disponible (déclenche la boîte de dialogue système) ; sinon message de
  repli avec les étapes manuelles (menu ⋮ du navigateur) — jamais un
  bouton qui ne ferait rien
- **iOS** : aucun bouton magique, un vrai tutoriel en 3 étapes numérotées
  (icône de partage → "Sur l'écran d'accueil" → "Ajouter"), avec des
  pictogrammes dessinés dans l'identité Assiettly plutôt que des captures
  de l'interface Apple (droits d'image) — **limite non contournable du
  navigateur, pas un choix de conception** : il n'existe aucune API pour
  déclencher l'installation depuis Safari iOS
- **Desktop** : message indiquant que l'expérience est pensée pour mobile
  + QR code généré à la volée (`qrcode`, nouvelle dépendance légère,
  génération SVG→data URL, zéro appel réseau externe) pointant vers
  l'origine courante — pertinent ici puisque quelqu'un qui découvre le
  lien sur ordinateur n'a sinon aucun moyen rapide de le retrouver sur son
  téléphone
- "Plus tard" toujours présent et discret (lien souligné, pas un bouton
  plein) tant que rien n'est installé ; devient un bouton "Continuer" plein
  une fois l'installation confirmée (événement `appinstalled`) — jamais
  bloquant, comme demandé

**Re-proposer depuis le profil** : le même composant partagé
(`CarteInstallationPwa`) est réutilisé tel quel dans `/profil`, sans le
cadre "Plus tard"/mockup propre à l'onboarding — pour les utilisateurs qui
ont choisi de ne pas installer tout de suite.

**Vérification** : `pnpm typecheck` + `pnpm build` propres. Manifest et
service worker confirmés publiquement joignables (`content-type:
application/manifest+json`, 200 sur `/sw.js` et `/icons/*`) et toutes les
balises `<head>` attendues présentes dans le HTML rendu. Les trois
variantes de `CarteInstallationPwa` (Android, iOS, desktop avec QR code
réel) vérifiées visuellement via user agents simulés sur `/profil`.

**Limite connue, honnête** : `beforeinstallprompt` ne se déclenche que
lorsque Chrome juge l'app installable selon ses propres heuristiques
(engagement de l'utilisateur, etc.) — impossible à forcer ni à tester de
façon garantie en local. Le chemin de repli (message manuel) a donc été
le seul testable dans ce sandbox ; le vrai bouton natif est à confirmer
sur un Android réel avant lancement.

## Connexion/inscription : Google et Apple désactivés temporairement

Les boutons "Continuer avec Google/Apple" posaient des bugs en usage réel.
**Retirés de l'interface, mais pas du plan produit** : `BoutonsOAuth.tsx`
n'est plus importé nulle part (ni `/connexion` ni `/inscription`) mais
reste en l'état dans le code, avec un commentaire explicite en tête de
fichier expliquant pourquoi il est isolé et comment le réactiver (il
suffit de le réimporter une fois le bug d'origine identifié et corrigé —
rien à réécrire). Le séparateur "ou avec ton e-mail" disparaît avec eux :
le formulaire email/mot de passe est redevenu le seul moyen de connexion,
donc plus rien à distinguer visuellement.

**Afficher/masquer le mot de passe** : nouveau composant partagé
`ChampMotDePasse.tsx` (utilisé sur les deux écrans plutôt que dupliqué) —
icône œil/œil barré dans le champ, zone de tap 44×44px (largeur du bouton
44px × pleine hauteur du champ), bascule `type="password"`/`type="text"`.

**Bouton de connexion/inscription réellement désactivé tant que les
champs sont vides** : ce n'était pas le cas avant (seul `loading`
désactivait le bouton) — ajouté `disabled={loading || !email || !password}`
sur les deux écrans, vérifié à l'exécution.

**Réagencement** : espacement vertical un peu plus généreux
(`space-y-5` → `space-y-8` entre les blocs) maintenant qu'il y a moins
d'éléments, pour que l'écran garde une composition équilibrée plutôt que
de paraître clairsemé.

**Vérification** : `pnpm typecheck` + `pnpm build` propres (taille des
bundles `/connexion` et `/inscription` en baisse, confirmant que le code
OAuth n'est plus embarqué) ; testé visuellement — bouton bien désactivé à
vide et activé une fois les deux champs remplis, bascule œil/œil barré
confirmée (`type` du champ passe de `password` à `text` au clic).

## Écran de vérification email : bug de redirection corrigé + refonte

**Bug réel trouvé et corrigé** : `supabase.auth.signUp()` était appelé sans
`options.emailRedirectTo`. Sans ce paramètre, le lien de confirmation reçu
par e-mail ramène l'utilisateur sur `/` (l'URL du site par défaut côté
Supabase) avec un `?code=...` dans l'URL qui n'est **jamais échangé contre
une session** — la landing page ne regarde pas ce paramètre. Résultat en
prod : l'utilisateur clique sur "confirmer", atterrit sur la landing,
reste non connecté, sans aucun message d'erreur. Corrigé en passant
`options: { emailRedirectTo: `${origin}/auth/callback` }` à `signUp()` (et
au `resend()` du bouton "Renvoyer l'email", qui avait le même trou). La
suite de la chaîne était déjà correcte et n'a pas eu besoin d'être
modifiée : `/auth/callback` échange le code puis redirige vers
`/accueil`, dont le layout (`(app)/layout.tsx`) redirige lui-même vers
`/onboarding` si `onboardingTermine` est faux — exactement la logique
demandée (onboarding non terminé → questionnaire, sinon → dashboard), déjà
en place depuis le prompt landing/auth mais qui ne pouvait jamais
s'exécuter tant que la session n'était pas établie.

**Écran refondu** (`EcranVerificationEmail.tsx`, remplace le bloc minimal
inline de `/inscription`) :
- Illustration enveloppe dessinée dans l'identité Assiettly
  (`IllustrationEnveloppe.tsx`, dégradé corail/ambre + badge de
  confirmation sarcelle) plutôt qu'un emoji seul — rendu identique sur
  tous les appareils
- Adresse exacte affichée ("Envoyé à prenom@exemple.fr")
- Mention discrète "Pense à vérifier tes spams"
- Bouton "Renvoyer l'email" avec compte à rebours de 45 s (déclenché dès
  l'arrivée sur l'écran, pas seulement après un renvoi manuel — la
  première demande vient tout juste de partir) via `supabase.auth.resend()`
- Lien "Retour à la connexion" conservé

**Détection automatique de la confirmation** : implémentée, pas
contournée. Deux mécanismes combinés : `supabase.auth.onAuthStateChange`
(événementiel — le client Supabase écoute déjà les changements de session
faits par un autre onglet du même navigateur via l'événement `storage`) et
un poll léger de secours (`getSession()` toutes les 4 s) en cas de
navigateur où cet événement serait peu fiable. Dès qu'une session est
détectée, redirection automatique vers `/accueil` (qui applique la même
logique onboarding/dashboard) — l'utilisateur n'a plus besoin de revenir
manuellement dans l'app après avoir cliqué sur le lien.
**Limite honnête** : ça ne fonctionne que si la confirmation a lieu dans le
même navigateur (stockage partagé) — sur un autre appareil (ex. lien
ouvert depuis un ordinateur pendant que l'inscription a eu lieu sur
mobile), aucun signal ne peut remonter sans backend poussant l'état
(WebSocket dédié), hors scope pour ce MVP ; l'utilisateur retombe alors
simplement sur `/connexion` comme avant, sans régression.

**Vérification** : `pnpm typecheck` + `pnpm build` propres. Le nouvel
écran a été vérifié visuellement (rendu, compte à rebours, désactivation
du bouton) via un composant monté en isolation — impossible de déclencher
un vrai `signUp()` dans cet environnement sans créer un compte réel sur le
projet Supabase de production.

## Comparatif mobile, relecture orthographe/formulation, logo

**Comparatif responsive** : le tableau `Comparatif.tsx` (landing) forçait
un `min-w-[480px]` avec défilement horizontal sur mobile — illisible d'un
coup d'œil sur téléphone. Remplacé sous `sm` par des cartes empilées (une
par critère, Assiettly vs apps généralistes côte à côte à l'intérieur de
la carte) ; le tableau classique reste affiché à partir de `sm`. Aucun
défilement horizontal nécessaire sur aucun format testé.

**Relecture orthographe/formulation** : passage sur l'ensemble des textes
visibles (landing, onboarding, dashboard, auth, pages légales). Corrections
réelles apportées :
- `CommentCaFonctionne.tsx` : verbe manquant ("dans tes objectifs" →
  "où tu restes dans tes objectifs"), pour matcher la formulation déjà
  correcte de la FAQ
- `CarteInstallationPwa.tsx` : accord de genre ("Assiettly est pensé" →
  "est pensée", cohérent avec "une application", "installée" ailleurs)
- `EtapePoidsCible.tsx` : négation mal formée ("n'hésite juste pas" →
  "n'hésite pas")
- `accueil/page.tsx` : métaphore bancale ("voir tes progrès se remplir" →
  "prendre forme")
- `MessageEncouragement.tsx` : tournure redondante ("suit bien la
  direction de ton objectif" → "va dans la bonne direction")
- `CarteMoyenneCalories.tsx` : anglicisme évitable ("vs les 7 jours
  précédents" → "par rapport aux 7 jours précédents")

Le reste des textes (boutons, placeholders, messages d'erreur, alt/aria)
était déjà correct.

**Logo** : système de marque à partir de la flamme déjà utilisée dans
l'app (`FlammeIcon.tsx`, mêmes coordonnées de tracé et même dégradé
ambre → corail, pour une identité parfaitement cohérente). Livré en SVG
autoportant (police Fredoka embarquée en base64 dans un `@font-face`
interne — rendu fidèle même sans la police installée sur la machine du
lecteur), dans `apps/web/public/brand/` :
- `assiettly-icone.svg` — la flamme seule, fond transparent (avatar,
  favicon, usages carrés)
- `assiettly-horizontal.svg` — flamme + texte "Assiettly", fond clair
- `assiettly-horizontal-sombre.svg` — même lockup, fond charbon foncé
- `assiettly-empile.svg` — flamme au-dessus du texte, centré

Prévisualisations PNG rendues via Playwright (même technique que pour les
icônes PWA) pour validation visuelle avant livraison.

## Bug de redirection après confirmation d'e-mail, e-mail de bienvenue, alignement Tarifs

**Bug de redirection identifié** : le lien de confirmation envoyé par
défaut (`{{ .ConfirmationURL }}`) utilise le flux PKCE — `/auth/callback`
échange un `code` contre une session via `exchangeCodeForSession`, ce qui
nécessite le `code_verifier` posé en cookie par le navigateur qui a initié
l'inscription. **Si le lien est ouvert dans un autre navigateur ou appareil
(webview Gmail/Outlook, ordinateur différent du téléphone, etc.), cet
échange échoue silencieusement** et l'utilisateur retombe sur
`/connexion?erreur=auth` au lieu d'atterrir sur `/onboarding` — c'est très
probablement le bug observé.

Correctif appliqué côté code (`/auth/callback/route.ts`) : la route accepte
désormais aussi un lien construit avec `token_hash` + `type`, vérifié via
`supabase.auth.verifyOtp()` — ce format ne dépend d'aucun cookie posé par
le navigateur d'origine et fonctionne donc quel que soit l'appareil ou le
navigateur utilisé pour cliquer sur le lien. C'est le format recommandé par
la documentation Supabase pour les apps SSR. Le `code` PKCE reste accepté
en parallèle (rétrocompatibilité, OAuth).

**Action manuelle requise, non faisable depuis cet environnement** (aucun
outil disponible ici n'a accès à la configuration Auth du projet Supabase
en production) : dans le dashboard Supabase → Authentication → Email
Templates, remplacer le lien des templates concernés pour qu'ils pointent
vers `token_hash` au lieu de `{{ .ConfirmationURL }}` :
- **Confirm signup** :
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`
- **Reset Password** :
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reinitialiser-mot-de-passe`

Tant que ce changement de template n'est pas appliqué, les e-mails
continueront à utiliser l'ancien lien `{{ .ConfirmationURL }}` (qui
fonctionne toujours, mais reste sujet au bug ci-dessus).

**E-mail de bienvenue** : ajouté (`emails/Bienvenue.tsx`, même habillage de
marque que `RappelFlamme.tsx`). Envoyé depuis `terminerOnboarding()` juste
après le passage de `onboardingTermine` à `true` — ce flag ne passe à
`true` qu'une seule fois par profil, donc l'e-mail ne part qu'une seule
fois par utilisateur, sans nouveau champ de suivi en base. Envoi en
best-effort (`try/catch` autour de `resend.emails.send()`) : un échec
(clé Resend absente en local, domaine pas encore vérifié) ne bloque jamais
la fin de l'onboarding.

**Alignement des cartes Tarifs (landing)** : bug réel trouvé par
capture d'écran Playwright — les deux cartes ("Gratuit" et "Premium")
avaient la même hauteur (stretch de grille), mais leurs boutons
n'étaient pas à la même hauteur : celui de la carte Gratuit "flottait"
plus haut, laissant un grand vide en dessous, faute de contenu au-dessus
comparable à celui de la carte Premium. Corrigé en rendant les deux
cartes `flex flex-col` avec `mt-auto` sur le bouton de la carte Gratuit,
qui vient maintenant s'aligner exactement sur celui de la carte Premium.

**Reste à auditer** : la remarque "pas bien aligné partout" est large ;
seul le rendu public (landing, connexion, inscription) a pu être vérifié
visuellement dans cet environnement — aucune base de données n'y est
joignable (`DATABASE_URL` pointe sur `localhost:5432`, injoignable depuis
ce sandbox), donc impossible d'afficher les écrans du dashboard avec des
données réelles ici pour les auditer visuellement. À revérifier sur un
environnement avec accès à la base (ou en production) si d'autres
problèmes d'alignement sont repérés dans le dashboard.

## Audit de bugs sur tout le SaaS

Suite à la demande "règle tous les bugs du SaaS", quatre passes d'audit
indépendantes (repas/scan/streak, dashboard/progrès, onboarding/calculs,
auth/paywall/Stripe) ont couvert l'ensemble du code serveur et des
composants. Bugs réels trouvés et corrigés (au-delà de ceux déjà listés
plus haut dans cette section) :

**Sécurité / autorisation**
- `supprimerAbonnementPush` ne vérifiait pas que l'abonnement push
  supprimé appartenait bien à l'appelant — scopé par `profileId`
- **Quota de scans gratuits jamais appliqué** : la landing et le paywall
  annoncent "3 scans de repas par semaine" pour l'offre gratuite, mais
  rien ne le faisait respecter — n'importe quel utilisateur non-Premium
  avait des scans IA illimités. Ajouté dans `scan.ts` : comptage des
  analyses réussies des 7 derniers jours glissants via `FoodAnalysisLog`
  (déjà en base, aucune migration nécessaire), bloqué au-delà de 3 pour
  les profils non premium

**Races / concurrence**
- `geler` (freeze de streak) : lire-vérifier-écrire le compteur mensuel
  non atomique, permettait de dépasser la limite de 2 freezes/mois par
  double-tap — transaction `SERIALIZABLE`
- `chercherParCodeBarre` : deux scans concurrents du même code-barres
  inédit plantaient sur la contrainte unique — récupère l'enregistrement
  créé par l'autre appel
- `demarrerAbonnement` (Stripe) : deux clics concurrents pouvaient créer
  deux clients Stripe différents pour le même profil — clé d'idempotence
  Stripe ajoutée, bouton de paywall désactivé pendant la redirection

**Fuseau horaire** — nouveau `src/lib/date.ts`, calcule "aujourd'hui" sur
Europe/Paris plutôt que l'horloge UTC du serveur/navigateur. Sans ça,
entre ~22h/23h UTC et minuit UTC (0h-2h du matin en France selon la
saison), le dashboard, le journal, les tendances de calories, le résumé
de streak et le calendrier mensuel raisonnaient encore sur "hier".
Appliqué à `accueil/page.tsx`, `journal/page.tsx`, `progres/page.tsx`,
`CalendrierMensuel.tsx`, `obtenirSemaineDashboard`,
`obtenirTendanceCalories`, `obtenirResumeStreak`, `terminerOnboarding`, et
côté client à `PoidsForm.tsx`, `AjouterRepasForm.tsx`, `EcranScan.tsx`
(tous utilisaient `new Date().toISOString().slice(0,10)`, qui reste en UTC
même dans le navigateur).

**Calculs / plafond de sécurité**
- `calculerObjectifs` (packages/shared) : aucun plancher sur l'objectif
  calorique calculé — pouvait descendre sous 700 kcal/j pour un profil
  petit/âgé/sédentaire en perte de poids. Plancher ajouté (1200 kcal
  femme, 1500 kcal homme/autre)
- `obtenirTendanceCalories` : frontière 7 jours / 7 jours précédents basée
  sur l'heure courante au lieu de minuit — décalait le classement d'un
  repas selon l'heure de chargement de la page

**Crash / états limites**
- `GraphiqueEvolutionPoids` : changer de filtre de période (90j/6 mois/1
  an/Tout) après avoir survolé un point pouvait laisser un index hors
  bornes et planter le graphique de poids
- `ajusterQuantiteRepas` : `deltaG` non validé (NaN/valeur extrême)
  pouvait produire un total absurde ou faire déborder une colonne Decimal
- `ajouterRepas` : un `foodId` invalide/supprimé produisait une erreur
  Prisma peu explicite au lieu d'un message clair
- `openFoodFacts.ts` : panne du service externe (réseau, timeout)
  plantait l'action de recherche par code-barres — encapsulé, timeout 8s
- `analyserRepas.ts` : une réponse JSON hors schéma remontait l'erreur
  Zod brute au client au lieu du message utilisateur prévu

**UI / affichage**
- `CarteSerieProgres` : les initiales de jours (L M M J V S D) étaient
  indexées par position dans la fenêtre glissante "aujourd'hui − 6 jours"
  au lieu du vrai jour de la semaine — faux sauf quand "aujourd'hui" tombe
  un dimanche
- `connexion/page.tsx` : `/auth/callback?erreur=auth` (lien expiré/invalide)
  redirigeait vers la connexion sans jamais afficher de message — échec
  totalement silencieux, corrigé
- `mealItemInputSchema` (aliment libre) : aucune borne haute sur les
  valeurs nutritionnelles saisies à la main — bornes ajoutées
- `BoutonsOAuth.tsx` : `type="button"` ajouté (composant dormant mais
  casserait le formulaire dès sa réactivation)

**Vérification** : `pnpm typecheck` et `pnpm build` propres après chaque
lot de correctifs. Aucune migration Prisma nécessaire — tous les
correctifs sont dans la logique applicative ou les colonnes déjà
existantes.

**Note produit non résolue** (signalée par un audit, décision produit
requise, pas corrigée unilatéralement) : `streakActuel` n'est recalculé
que lors d'une action (repas ajouté, freeze) — un streak cassé par pure
inaction reste affiché comme intact jusqu'à la prochaine action de
l'utilisateur. Nécessiterait un job planifié pour recalculer
proactivement ; pas fait ici.

## Préparation acquisition : RGPD, pages légales, délai de navigation dashboard

Suite à "prêt pour l'acquisition ?" et "tout ce que tu peux faire, fait" —
tout ce qui pouvait être fait depuis ce sandbox (sans accès à un vrai
Supabase/Stripe/Vercel) a été fait :

**RGPD — export et suppression de compte, réellement implémentés** (pas
un placeholder) :
- `src/server/actions/rgpd.ts` : `exporterMesDonnees()` renvoie toutes les
  données personnelles du profil (profil, objectifs, repas, poids, streak,
  métadonnées d'analyses photo — jamais les photos elles-mêmes, jamais
  stockées) en JSON, téléchargé côté client par `BoutonExportDonnees.tsx`.
  `supprimerMonCompte()` annule immédiatement l'abonnement Stripe en cours,
  supprime le compte Supabase Auth (si `SUPABASE_SERVICE_ROLE_KEY` est
  configurée — **nouvelle variable d'environnement optionnelle, à
  renseigner en production**, cf. `.env.example` ; Project Settings > API >
  service_role), puis supprime le profil Prisma (cascade sur repas, poids,
  streaks, objectifs, abonnement, push). Protégé côté UI par une saisie de
  confirmation explicite (`BoutonSupprimerCompte.tsx`) avant d'activer le
  bouton — action irréversible.
- **Sans `SUPABASE_SERVICE_ROLE_KEY` configurée**, la suppression efface
  bien toutes les données applicatives mais laisse le compte Supabase Auth
  actif (l'utilisateur pourrait se reconnecter et redémarrer un onboarding
  vierge) — à corriger simplement en renseignant cette clé en production.

**Pages légales réelles** — CGU, politique de confidentialité et mentions
légales ne sont plus des placeholders (`PageLegaleStub` supprimé, plus
utilisé nulle part) : contenu réel et substantiel pour chaque page,
vérifié contre le code réel (tarifs exacts, durée d'essai, ce qui est
envoyé à Anthropic, hébergement Supabase eu-west-3, absence de tout
tracking/analytics dans le code). **Reste à compléter avant lancement
public** : les informations d'identité légale de l'entreprise, marquées
`[À compléter : ...]` dans `mentions-legales/page.tsx` — raison
sociale/forme juridique, adresse du siège, SIRET, TVA intracommunautaire,
capital social, nom du directeur de publication. Faire relire l'ensemble
par un professionnel du droit avant le lancement public — ce contenu est
sérieux et exact mais n'a pas été rédigé par un juriste.

**Délai de navigation dans le dashboard ramené à zéro perçu** : ajout de
`loading.tsx` (squelettes de chargement au style de la marque) sur
`accueil`, `journal`, `progres`, `profil` et `repas/[id]` — Next.js les
affiche instantanément pendant l'aller-retour serveur, au lieu d'un écran
blanc. `BarreNavigation` utilisait déjà `next/link` (préchargement
automatique des onglets visibles). **Limite honnête** : ceci élimine le
blanc perçu, ce n'est pas un aller-retour serveur réellement nul (impossible
sans accès à une vraie base de données pour mesurer/optimiser davantage
depuis ce sandbox).

**Batch des migrations** : les 5 migrations en attente ont été livrées en
un seul fichier SQL (envoyé directement à l'utilisateur), avec
recommandation d'utiliser `npx prisma migrate deploy` plutôt qu'un
copier-coller manuel dans l'éditeur SQL Supabase (idempotent, garde la
table de suivi Prisma cohérente).

**Vérification** : `pnpm typecheck` et `pnpm build` propres après chaque
lot de changements.

## Prochaines étapes suggérées

1. Renseigner une vraie clé `ANTHROPIC_API_KEY` (actuellement un
   placeholder) et tester le scan de repas de bout en bout sur de vraies
   photos — en particulier les plats composites (quiches, lasagnes, plats
   en sauce) pour juger si Sonnet 4.5 suffit ou si Opus 4.5 est nécessaire
2. Tester l'installation PWA sur un vrai téléphone Android (le prompt
   natif `beforeinstallprompt` dépend des heuristiques de Chrome,
   impossible à garantir en local) et sur iOS (tutoriel manuel)
3. Diagnostiquer le bug de connexion Google/Apple (désactivée côté
   interface entre-temps, cf. plus bas), puis activer les fournisseurs
   dans Supabase Auth (Authentication → Providers) pour que les boutons OAuth
   fonctionnent réellement
4. Vérifier le domaine `assiettly.fr` sur Resend et renseigner les clés
5. Implémenter les Groupes (V2) : création/invitation, classement par
   streak persistant, réactions et commentaires — remplacer
   `FluxGroupesMock` par de vraies données
6. Écran "Avant / Après" dans le Profil (comparaison de deux photos +
   poids/date, option masquer le poids, partage) — évoqué dans le brief du
   dashboard comme piste à évaluer, pas encore construit
7. Étendre les e-mails Resend : bienvenue à l'inscription, fin d'essai Stripe
   proche, célébration d'un palier de badge atteint
8. Animation de célébration des paliers de badges à l'ouverture de l'app
9. Rédiger les vraies pages légales (CGU, confidentialité, mentions
   légales — actuellement des placeholders) et les endpoints
   export/suppression de données RGPD
