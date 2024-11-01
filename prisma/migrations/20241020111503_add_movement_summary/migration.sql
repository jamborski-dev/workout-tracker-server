/*
  Warnings:

  - You are about to drop the `PlannedMovement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlannedSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoutineTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Set` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `muscleGroup` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlannedMovement" DROP CONSTRAINT "PlannedMovement_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "PlannedMovement" DROP CONSTRAINT "PlannedMovement_routineTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "PlannedSet" DROP CONSTRAINT "PlannedSet_plannedMovementId_fkey";

-- DropForeignKey
ALTER TABLE "RoutineTemplate" DROP CONSTRAINT "RoutineTemplate_userId_fkey";

-- DropForeignKey
ALTER TABLE "Set" DROP CONSTRAINT "Set_movementId_fkey";

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "muscleGroup" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Movement" ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "supabaseId" DROP NOT NULL;

-- DropTable
DROP TABLE "PlannedMovement";

-- DropTable
DROP TABLE "PlannedSet";

-- DropTable
DROP TABLE "RoutineTemplate";

-- DropTable
DROP TABLE "Set";

-- CreateTable
CREATE TABLE "MovementSet" (
    "id" SERIAL NOT NULL,
    "movementId" INTEGER NOT NULL,
    "plannedReps" INTEGER NOT NULL,
    "actualReps" INTEGER,
    "plannedWeight" DOUBLE PRECISION NOT NULL,
    "actualWeight" DOUBLE PRECISION,
    "restTime" INTEGER,

    CONSTRAINT "MovementSet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MovementSet" ADD CONSTRAINT "MovementSet_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "Movement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
