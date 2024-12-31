-- DropForeignKey
ALTER TABLE "Specification" DROP CONSTRAINT "Specification_contractId_fkey";

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
