-- AlterTable
ALTER TABLE "Routine" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "name" SET DEFAULT 'New Routine';
