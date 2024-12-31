-- AlterTable
ALTER TABLE "Specification" ADD COLUMN     "vehicleId" TEXT;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
