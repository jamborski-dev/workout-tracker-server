-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_exerciseId_fkey";

-- AlterTable
ALTER TABLE "Movement" ALTER COLUMN "exerciseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
