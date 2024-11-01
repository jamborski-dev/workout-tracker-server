-- AlterTable
ALTER TABLE "Movement" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "MovementSet" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
