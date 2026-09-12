-- CreateTable
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

-- CreateIndex
CREATE INDEX "food_analysis_logs_profile_id_idx" ON "food_analysis_logs"("profile_id");

-- AddForeignKey
ALTER TABLE "food_analysis_logs" ADD CONSTRAINT "food_analysis_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
