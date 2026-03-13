-- AlterTable
ALTER TABLE `Product` ADD COLUMN `bestseller` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `discount` DOUBLE NULL DEFAULT 0;
