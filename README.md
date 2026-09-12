# Assiettly

Suivi nutritionnel par IA pour le marché français — SaaS web (pas une app
mobile), pensé pour la langue, les aliments et la culture culinaire
françaises, avec un système d'engagement à base de "flammes" (streaks)
inspiré de Duolingo/Strava.

## Architecture

Monorepo pnpm :

```
apps/
  web/      SaaS — Next.js 14 (App Router), déployé sur Vercel
packages/
  shared/   Types, schémas de validation (zod) et logique métier partagée
            (calcul des objectifs caloriques, projection, calcul de streak)
```

- **Auth & base de données** : [Supabase](https://supabase.com) (Auth gérée +
  Postgres managé, région UE pour la conformité RGPD).
- **App web** : Next.js App Router — Server Components + Server Actions pour
  les mutations (pas d'API REST séparée), Prisma pour l'accès à la base.
- **Paiement** : Stripe Checkout (abonnement avec essai gratuit de 7 jours,
  carte requise mais non débitée avant la fin de l'essai) + webhook pour
  synchroniser le statut d'abonnement.
- **Aliments emballés** : [Open Food Facts](https://world.openfoodfacts.org)
  comme base de données de départ, avec cache local en base au premier scan.
- **IA vision (scan photo de repas)** : prévue via l'API Claude (Anthropic),
  non implémentée dans ce MVP (voir PROGRESS.md).
- **E-mails transactionnels** : [Resend](https://resend.com) + templates
  [React Email](https://react.email) aux couleurs de la marque — rappel
  quotidien envoyé (via un cron Vercel) à qui risque de perdre sa flamme.

Voir [PROGRESS.md](./PROGRESS.md) pour le détail des décisions et l'avancement.

## Identité de marque

- **Ton** : chaleureux, simple, motivant — jamais culpabilisant sur
  l'alimentation.
- **Palette** : corail (`#F2603C`) comme couleur d'action, sarcelle
  (`#1F7A6C`) comme accent santé/fraîcheur, ambre pour la mécanique de
  flamme, sur fond ivoire chaud — volontairement distincte des codes
  visuels rouge/orange des apps concurrentes.
- **Typographie** : Fredoka (titres, arrondie et chaleureuse) + Inter (corps
  de texte, lisible).
- **Marque flamme** : icône SVG propre à Assiettly (dégradé ambre → corail),
  pas un émoji ni une icône tierce.

Palette et typo définies dans `apps/web/tailwind.config.ts` et
`apps/web/src/app/layout.tsx`.

## Prérequis

- Node.js ≥ 20, [pnpm](https://pnpm.io) ≥ 9
- Un projet [Supabase](https://supabase.com) (région UE recommandée)
- Un compte [Stripe](https://stripe.com) en mode test pour la facturation

## Mise en route

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Configurer Supabase

1. Crée un projet sur [supabase.com](https://supabase.com) (région UE, ex. Paris/Frankfurt).
2. Récupère dans **Project Settings > API** : `Project URL`, `anon public key`.
3. Récupère la chaîne de connexion Postgres dans **Project Settings > Database > Connection string**.

### 3. Configurer Stripe

1. Crée deux prix récurrents (mensuel + annuel) dans le Dashboard Stripe.
2. Crée un endpoint de webhook pointant vers `<NEXT_PUBLIC_APP_URL>/api/webhooks/stripe`,
   écoutant `customer.subscription.created|updated|deleted`.

### 4. Configurer les notifications push

Génère une paire de clés VAPID (une seule fois — ne jamais les régénérer
ensuite, ça invaliderait tous les abonnements existants) :

```bash
npx web-push generate-vapid-keys
```

Renseigne `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` et
`VAPID_SUBJECT` (`mailto:ton-email@assiettly.fr`).

### 5. Configurer Resend (rappels de flamme par e-mail)

1. Crée un compte sur [resend.com](https://resend.com), récupère une clé API.
2. Ajoute et vérifie ton domaine d'envoi (DNS DKIM/SPF fournis par Resend).
3. Choisis un `CRON_SECRET` (chaîne aléatoire) — Vercel Cron l'enverra
   automatiquement dans l'en-tête `Authorization` pour protéger la route.

### 6. Configurer et lancer l'app

```bash
cp apps/web/.env.example apps/web/.env
# renseigner DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL,
# NEXT_PUBLIC_SUPABASE_ANON_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
# STRIPE_PRICE_ID_*, NEXT_PUBLIC_APP_URL, RESEND_API_KEY, RESEND_FROM_EMAIL,
# CRON_SECRET, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

pnpm --filter @assiettly/web prisma:migrate   # crée les tables
pnpm --filter @assiettly/web dev              # démarre sur http://localhost:3000
```

Le cron des rappels de flamme (`apps/web/vercel.json`) ne tourne
automatiquement qu'une fois déployé sur Vercel. En local, teste-le
directement :

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/streak-reminders
```

## Scripts utiles

| Commande | Description |
|---|---|
| `pnpm --filter @assiettly/web dev` | Démarre l'app en mode développement |
| `pnpm --filter @assiettly/web build` | Build de production (Vercel l'utilise automatiquement) |
| `pnpm --filter @assiettly/web prisma:studio` | Explorateur visuel de la base |
| `pnpm typecheck` | Vérifie les types sur tous les packages |

## Fonctionnalités du MVP actuel

- Authentification (email / mot de passe via Supabase Auth)
- **Onboarding multi-étapes** (une question par écran, barre de progression) :
  objectif, sexe, âge, taille, poids actuel/cible, niveau d'activité,
  fréquence de sport
- Calcul immédiat des objectifs caloriques et macros (Mifflin-St Jeor), avec
  explication de la méthode, puis écran de projection ("objectif atteint
  vers le...")
- **Paywall** après l'onboarding : comparatif gratuit/premium, essai Stripe
  de 7 jours (carte requise, non débitée avant la fin), ou accès gratuit
- Dashboard avec **anneau de progression calorique** + barres de macros
- Ajout de repas : recherche d'aliments, scan de code-barres (Open Food
  Facts), quantité ajustable
- Suivi de poids avec graphique de tendance
- Système de flamme : calcul quotidien, freeze (2/mois), paliers de badges
  (7/30/100/365 jours), **écran calendrier mensuel** dédié
- **Rappel quotidien par e-mail** (Resend) **et notification push**
  (opt-in à l'onboarding, activable/désactivable depuis le profil) si la
  flamme est en danger

## Non implémenté dans ce MVP (prévu ensuite)

- Scan de repas par photo (IA vision — API Claude/Anthropic prévue)
- Connexion Google / Apple (actuellement email/mot de passe uniquement)
- Scanner de code-barres via la caméra (saisie manuelle du code pour l'instant)
- Animation de célébration des paliers de badges à l'ouverture de l'app
- Fonctionnalités sociales (classement, défis — V2)

## Conformité RGPD

Le MVP pose les bases (hébergement UE via Supabase, données de santé isolées
par utilisateur) mais les mentions légales, CGU, politique de confidentialité,
et les endpoints d'export/suppression de données restent à écrire avant tout
lancement public.
