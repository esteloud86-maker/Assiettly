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
allumée (`streakSummary.streakActuel > 0`) mais qui n'a encore loggé aucun
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

## Prochaines étapes suggérées

1. Vérifier le domaine `assiettly.fr` sur Resend et renseigner les clés
2. Intégrer l'IA vision (scan photo) avec l'API Claude
3. Étendre les e-mails Resend : bienvenue à l'inscription, fin d'essai Stripe
   proche, célébration d'un palier de badge atteint
4. Animation de célébration des paliers de badges à l'ouverture de l'app
5. CGU / politique de confidentialité / endpoints export-suppression RGPD
6. Connexion Google / Apple via Supabase Auth
