/*
  Warnings:

  - A unique constraint covering the columns `[artworkId,name]` on the table `PrintOption` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Artwork` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Order` MODIFY `currency` VARCHAR(191) NOT NULL DEFAULT 'RWF';

-- CreateIndex
CREATE INDEX `Artist_email_idx` ON `Artist`(`email`);

-- CreateIndex
CREATE INDEX `Artwork_slug_idx` ON `Artwork`(`slug`);

-- CreateIndex
CREATE INDEX `Artwork_deletedAt_idx` ON `Artwork`(`deletedAt`);

-- CreateIndex
CREATE INDEX `CommissionRequest_email_createdAt_idx` ON `CommissionRequest`(`email`, `createdAt`);

-- CreateIndex
CREATE INDEX `Gallery_slug_idx` ON `Gallery`(`slug`);

-- CreateIndex
CREATE INDEX `Order_email_createdAt_idx` ON `Order`(`email`, `createdAt`);

-- CreateIndex
CREATE UNIQUE INDEX `PrintOption_artworkId_name_key` ON `PrintOption`(`artworkId`, `name`);

-- RenameIndex
ALTER TABLE `ArtworkGallery` RENAME INDEX `ArtworkGallery_galleryId_fkey` TO `ArtworkGallery_galleryId_idx`;

-- RenameIndex
ALTER TABLE `OrderItem` RENAME INDEX `OrderItem_orderId_fkey` TO `OrderItem_orderId_idx`;
