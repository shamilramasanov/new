-- DropForeignKey
ALTER TABLE "InventoryItem" DROP CONSTRAINT "InventoryItem_categoryId_fkey";

-- AlterTable
ALTER TABLE "Specification" ADD COLUMN     "inventoryItemId" TEXT;

-- AddForeignKey
ALTER TABLE "Specification" ADD CONSTRAINT "Specification_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InventoryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
