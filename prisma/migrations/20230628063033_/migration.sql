-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PLACED';

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_size_fkey" FOREIGN KEY ("productId", "size") REFERENCES "Inventory"("productId", "size") ON DELETE CASCADE ON UPDATE CASCADE;
