-- DropForeignKey
ALTER TABLE "MovementSet" DROP CONSTRAINT "MovementSet_movementId_fkey";

-- AddForeignKey
ALTER TABLE "MovementSet" ADD CONSTRAINT "MovementSet_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "Movement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
