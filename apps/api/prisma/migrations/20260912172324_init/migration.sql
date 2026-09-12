-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('HOMME', 'FEMME');

-- CreateEnum
CREATE TYPE "NiveauActivite" AS ENUM ('SEDENTAIRE', 'LEGER', 'MODERE', 'ACTIF', 'TRES_ACTIF');

-- CreateEnum
CREATE TYPE "ObjectifType" AS ENUM ('PERTE', 'MAINTIEN', 'PRISE_MASSE');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('PETIT_DEJ', 'DEJEUNER', 'DINER', 'COLLATION');

-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('MANUEL', 'OPEN_FOOD_FACTS');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT,
    "date_naissance" DATE,
    "sexe" "Sexe",
    "taille_cm" INTEGER,
    "niveau_activite" "NiveauActivite",
    "objectif_type" "ObjectifType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_goals" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "objectif_calories_kcal" INTEGER NOT NULL,
    "objectif_proteines_g" INTEGER NOT NULL,
    "objectif_glucides_g" INTEGER NOT NULL,
    "objectif_lipides_g" INTEGER NOT NULL,
    "tolerance_pct" INTEGER NOT NULL DEFAULT 10,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "actif_depuis" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_logs" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "poids_kg" DECIMAL(5,2) NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "marque" TEXT,
    "source" "FoodSource" NOT NULL DEFAULT 'MANUEL',
    "code_barre" TEXT,
    "calories_kcal_100g" DECIMAL(6,2) NOT NULL,
    "proteines_g_100g" DECIMAL(6,2) NOT NULL,
    "glucides_g_100g" DECIMAL(6,2) NOT NULL,
    "lipides_g_100g" DECIMAL(6,2) NOT NULL,
    "fibres_g_100g" DECIMAL(6,2),
    "created_by_profile_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "type" "MealType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_items" (
    "id" UUID NOT NULL,
    "meal_id" UUID NOT NULL,
    "food_id" UUID,
    "nom_libre" TEXT,
    "quantite_g" DECIMAL(7,2) NOT NULL,
    "calories_kcal" DECIMAL(7,2) NOT NULL,
    "proteines_g" DECIMAL(6,2) NOT NULL,
    "glucides_g" DECIMAL(6,2) NOT NULL,
    "lipides_g" DECIMAL(6,2) NOT NULL,
    "fibres_g" DECIMAL(6,2),

    CONSTRAINT "meal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streak_days" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "flamme_allumee" BOOLEAN NOT NULL DEFAULT false,
    "freeze_utilise" BOOLEAN NOT NULL DEFAULT false,
    "calories_jour" INTEGER NOT NULL,
    "objectif_respecte" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streak_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streak_summaries" (
    "profile_id" UUID NOT NULL,
    "streak_actuel" INTEGER NOT NULL DEFAULT 0,
    "streak_max" INTEGER NOT NULL DEFAULT 0,
    "freezes_utilises_mois" INTEGER NOT NULL DEFAULT 0,
    "mois_reference_freeze" DATE,
    "dernier_jour_flamme" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streak_summaries_pkey" PRIMARY KEY ("profile_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "user_goals_profile_id_actif_idx" ON "user_goals"("profile_id", "actif");

-- CreateIndex
CREATE UNIQUE INDEX "weight_logs_profile_id_date_key" ON "weight_logs"("profile_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "foods_code_barre_key" ON "foods"("code_barre");

-- CreateIndex
CREATE INDEX "foods_nom_idx" ON "foods"("nom");

-- CreateIndex
CREATE INDEX "meals_profile_id_date_idx" ON "meals"("profile_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "streak_days_profile_id_date_key" ON "streak_days"("profile_id", "date");

-- AddForeignKey
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_logs" ADD CONSTRAINT "weight_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak_days" ADD CONSTRAINT "streak_days_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak_summaries" ADD CONSTRAINT "streak_summaries_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
