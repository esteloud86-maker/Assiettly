# Journal de progression — Assiettly

## Décisions d'architecture (validées avec l'utilisateur)

| Sujet | Choix |
|---|---|
| Frontend mobile | React Native + Expo |
| Backend | Node.js/TypeScript + Fastify + Prisma |
| Auth & DB managée | Supabase (Auth + Postgres, région UE) |
| Structure du repo | Monorepo pnpm (`apps/*`, `packages/*`) |
| Base alimentaire emballée | Open Food Facts, mise en cache locale au premier scan |
| IA vision (scan photo) | Différée en V2, hors du MVP |

## Étape 1 — Scaffolding du monorepo

- `pnpm-workspace.yaml` + `package.json` racine (scripts `dev:api`, `dev:mobile`, `prisma:*`)
- `.gitignore` couvrant node_modules, builds, `.env`, `.expo`

## Étape 2 — `packages/shared`

Logique métier partagée entre l'API et (à terme) le mobile, pour éviter toute
divergence de calcul entre client et serveur :

- `nutrition.ts` : calcul du métabolisme de base (Mifflin-St Jeor), du TDEE
  (facteur d'activité), et des objectifs caloriques/macros selon l'objectif
  (perte/maintien/prise de masse). Répartition macro par défaut : 30% protéines
  / 40% glucides / 30% lipides.
- `streak.ts` : logique pure de calcul de streak — `evaluerObjectifJour` (une
  flamme s'allume si ≥1 repas loggé ET calories dans la tolérance ±10% de
  l'objectif), `calculerStreakSummary` (streak actuel/max à partir de
  l'historique), paliers de badges (7/30/100/365 jours).
- `schemas.ts` : validation zod des payloads API (profil, poids, aliments,
  repas, freeze de streak).

## Étape 3 — `apps/api` (Fastify + Prisma)

**Schéma de base de données** (`prisma/schema.prisma`) :
`profiles` (lié à `auth.users` de Supabase via le même UUID), `user_goals`,
`weight_logs`, `foods`, `meals` + `meal_items`, `streak_days`,
`streak_summaries`.

**Auth** : plugin Fastify qui vérifie le JWT Supabase (HS256, `jose`) et
attache `request.auth.{profileId, email}` à chaque requête. Enveloppé avec
`fastify-plugin` pour que le hook s'applique globalement à toutes les routes
enregistrées sur l'instance (sinon l'encapsulation Fastify l'aurait limité au
seul contexte du plugin).

**Routes** :
- `GET/PUT /me`, `POST /me/goals/calculate` (calcule et active un nouvel objectif)
- `GET/POST /weight`
- `GET /foods/search`, `GET /foods/barcode/:code` (Open Food Facts + cache DB), `POST /foods`
- `GET/POST/DELETE /meals` (journal du jour + totaux, recalcul du streak à chaque changement)
- `GET /streaks/summary`, `GET /streaks/calendar`, `POST /streaks/freeze`

**Simplification assumée** : le streak est recalculé à la volée à chaque
ajout/suppression de repas, pas via un cron quotidien de fin de journée. Un
jour non encore terminé n'est donc jamais compté comme "manqué" avant qu'un
autre jour soit loggé — un cron de clôture à minuit serait une amélioration
naturelle pour gérer les oublis complets (aucun repas du tout, aucun log qui
déclenche un recalcul).

Vérifié : `pnpm typecheck` passe sans erreur, `prisma generate` fonctionne.

## Étape 4 — `apps/mobile` (Expo React Native)

Écrans livrés : Connexion/Inscription (Supabase Auth), Onboarding (profil
physique → calcul auto des objectifs), Accueil (flamme + progression du jour),
Journal (repas du jour, ajout via recherche d'aliment ou code-barres saisi
manuellement, suppression), Poids (graphique de tendance en SVG), Profil
(déconnexion, rappel RGPD).

Non couvert dans ce MVP : connexion Google/Apple, scan caméra du code-barres,
scan photo IA, notifications push, écran calendrier mensuel (l'API existe déjà
via `/streaks/calendar`, il manque l'écran).

Vérifié : `pnpm typecheck` passe sans erreur sur le package mobile.

## Prochaines étapes suggérées

1. Créer le projet Supabase et renseigner les `.env` (voir README)
2. Lancer `prisma migrate dev` pour créer les tables
3. Tester le parcours complet sur Expo Go : inscription → onboarding → ajout
   d'un repas → vérifier que la flamme s'allume
4. Écran calendrier mensuel (façon Strava) branché sur `/streaks/calendar`
5. Notifications push (Expo Notifications + rappel avant minuit)
6. Intégration IA vision pour le scan photo de repas
7. CGU / politique de confidentialité / endpoints export-suppression RGPD
8. Abonnement premium (paiement CB/Apple Pay/Google Pay)
