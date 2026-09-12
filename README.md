# Assiettly

Application de suivi nutritionnel par IA pour le marché français — un concurrent
de CalAI pensé pour la langue, les aliments et la culture culinaire françaises,
avec un système d'engagement à base de "flammes" (streaks) inspiré de
Duolingo/Strava.

## Architecture

Monorepo pnpm :

```
apps/
  api/      API REST — Fastify + TypeScript + Prisma (PostgreSQL)
  mobile/   App mobile — React Native (Expo) pour iOS + Android
packages/
  shared/   Types, schémas de validation (zod) et logique métier partagée
            (calcul des objectifs caloriques, calcul de streak)
```

- **Auth & base de données** : [Supabase](https://supabase.com) (Auth gérée +
  Postgres managé, région UE disponible pour la conformité RGPD).
- **API** : Fastify + Prisma, déployée séparément (Scaleway/OVH ou autre hébergeur UE),
  vérifie les JWT émis par Supabase Auth.
- **Aliments emballés** : [Open Food Facts](https://world.openfoodfacts.org) comme
  base de données de départ, avec cache local en base au premier scan.
- **IA vision (scan photo de repas)** : non implémentée dans ce MVP, prévue en V2.

Voir [PROGRESS.md](./PROGRESS.md) pour le détail des décisions et l'avancement.

## Prérequis

- Node.js ≥ 20, [pnpm](https://pnpm.io) ≥ 9
- Un projet [Supabase](https://supabase.com) (gratuit pour démarrer)
- Expo Go (app mobile) ou un simulateur iOS/Android pour tester l'app

## Mise en route

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Configurer Supabase

1. Crée un projet sur [supabase.com](https://supabase.com) (choisis une région UE, ex. Frankfurt).
2. Récupère dans **Project Settings > API** : `Project URL`, `anon public key`, et **Project Settings > API > JWT Settings** : `JWT Secret`.
3. Récupère la chaîne de connexion Postgres dans **Project Settings > Database > Connection string** (mode "Transaction" ou "Session" selon ton besoin).

### 3. Configurer l'API

```bash
cp apps/api/.env.example apps/api/.env
# renseigner DATABASE_URL, SUPABASE_URL, SUPABASE_JWT_SECRET
pnpm --filter @assiettly/api prisma:migrate   # crée les tables
pnpm dev:api                                  # démarre l'API sur http://localhost:3000
```

### 4. Configurer l'app mobile

```bash
cp apps/mobile/.env.example apps/mobile/.env
# renseigner EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL
pnpm dev:mobile
```

Scanne le QR code avec l'app **Expo Go** (iOS/Android) ou lance un simulateur.

> Sur un appareil physique, `EXPO_PUBLIC_API_URL` doit pointer vers une adresse
> accessible depuis le téléphone (IP locale de ta machine, pas `localhost`).

Tu peux aussi lancer l'app dans un navigateur (pratique pour un aperçu rapide,
sans Expo Go) :

```bash
pnpm --filter @assiettly/mobile web
```

## Scripts utiles

| Commande | Description |
|---|---|
| `pnpm dev:api` | Démarre l'API en mode watch |
| `pnpm dev:mobile` | Démarre le serveur de développement Expo |
| `pnpm --filter @assiettly/api prisma:studio` | Explorateur visuel de la base |
| `pnpm typecheck` | Vérifie les types sur tous les packages |

## Fonctionnalités du MVP actuel

- Authentification (email / mot de passe via Supabase Auth)
- Onboarding : profil physique → calcul automatique de l'objectif calorique
  (formule de Mifflin-St Jeor) et des macros (protéines/glucides/lipides)
- Ajout de repas : recherche d'aliments, scan de code-barres (saisie manuelle
  du code, via Open Food Facts), ou aliment libre avec valeurs personnalisées
- Journal quotidien avec totaux vs objectifs
- Suivi de poids avec graphique de tendance
- Système de flamme : calcul quotidien, freeze (2/mois), paliers de badges
  (7/30/100/365 jours)

## Non implémenté dans ce MVP (prévu ensuite)

- Scan de repas par photo (IA vision)
- Connexion Google / Apple (actuellement email/mot de passe uniquement)
- Scanner de code-barres via la caméra (saisie manuelle du code pour l'instant)
- Notifications push quotidiennes ("ne perds pas ta flamme")
- Écran calendrier mensuel type Strava (l'API `/streaks/calendar` existe déjà)
- Abonnement premium / paiement
- Fonctionnalités sociales (V2)

## Conformité RGPD

Le MVP pose les bases (hébergement UE via Supabase, données de santé isolées
par utilisateur) mais les mentions légales, CGU, politique de confidentialité,
et les endpoints d'export/suppression de données restent à écrire avant tout
lancement public.
