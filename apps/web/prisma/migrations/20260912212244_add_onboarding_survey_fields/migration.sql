-- CreateEnum
CREATE TYPE "TypeAlimentation" AS ENUM ('EQUILIBRE', 'VEGETARIEN', 'VEGAN', 'PESCETARIEN', 'FLEXITARIEN');

-- CreateEnum
CREATE TYPE "MotivationPrincipale" AS ENUM ('MIEUX_MANGER', 'PLUS_ENERGIE', 'RESTER_MOTIVE', 'BIEN_DANS_SON_CORPS');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "deja_utilise_app_suivi" BOOLEAN,
ADD COLUMN     "freins" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "motivation_principale" "MotivationPrincipale",
ADD COLUMN     "suivi_par_coach" BOOLEAN,
ADD COLUMN     "type_alimentation" "TypeAlimentation";
