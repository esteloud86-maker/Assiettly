-- CreateEnum
CREATE TYPE "EvenementType" AS ENUM ('PARTAGE_CARTE', 'INVITATION_ENVOYEE', 'PAYWALL_VU', 'ABONNEMENT_DEMARRE');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "code_parrainage" TEXT;

-- CreateTable
CREATE TABLE "repas_favoris" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "MealType" NOT NULL,
    "items" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repas_favoris_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "type" "EvenementType" NOT NULL,
    "contexte" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parrainages" (
    "id" UUID NOT NULL,
    "parrain_id" UUID NOT NULL,
    "filleul_id" UUID NOT NULL,
    "valide" BOOLEAN NOT NULL DEFAULT false,
    "valide_le" TIMESTAMP(3),
    "recompense_accordee" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parrainages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repas_favoris_profile_id_idx" ON "repas_favoris"("profile_id");

-- CreateIndex
CREATE INDEX "analytics_events_type_created_at_idx" ON "analytics_events"("type", "created_at");

-- CreateIndex
CREATE INDEX "analytics_events_profile_id_idx" ON "analytics_events"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "parrainages_filleul_id_key" ON "parrainages"("filleul_id");

-- CreateIndex
CREATE INDEX "parrainages_parrain_id_idx" ON "parrainages"("parrain_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_code_parrainage_key" ON "profiles"("code_parrainage");

-- AddForeignKey
ALTER TABLE "repas_favoris" ADD CONSTRAINT "repas_favoris_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_parrain_id_fkey" FOREIGN KEY ("parrain_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_filleul_id_fkey" FOREIGN KEY ("filleul_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

