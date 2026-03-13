-- AlterTable
ALTER TABLE `Order` MODIFY `totalAmount` DECIMAL(18, 2) NOT NULL,
    MODIFY `shippingAmount` DECIMAL(18, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `OrderItem` MODIFY `price` DECIMAL(18, 2) NOT NULL;

-- AlterTable
ALTER TABLE `Product` MODIFY `price` DECIMAL(18, 2) NOT NULL,
    MODIFY `discount` DECIMAL(18, 2) NULL DEFAULT 0;
