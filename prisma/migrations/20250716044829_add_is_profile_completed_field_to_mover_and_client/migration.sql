-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "isProfileCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Mover" ADD COLUMN     "isProfileCompleted" BOOLEAN NOT NULL DEFAULT false;
