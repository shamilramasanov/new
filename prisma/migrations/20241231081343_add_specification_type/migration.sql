/*
  Warnings:

  - You are about to drop the column `amount` on the `Specification` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Specification` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Specification` table. All the data in the column will be lost.
  - Made the column `serviceCount` on table `Specification` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Specification" DROP CONSTRAINT "Specification_contractId_fkey";

-- AlterTable
ALTER TABLE "Specification" DROP COLUMN "amount",
DROP COLUMN "section",
DROP COLUMN "total",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'part',
ALTER COLUMN "serviceCount" SET NOT NULL,
ALTER COLUMN "serviceCount" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
