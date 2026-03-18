-- CreateTable (already exists in DB — marking as applied baseline)
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `artworkId` VARCHAR(191) NULL,
    `artistId` VARCHAR(191) NULL,

    INDEX `Comment_artworkId_idx`(`artworkId`),
    INDEX `Comment_artistId_idx`(`artistId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Like` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `artworkId` VARCHAR(191) NULL,
    `artistId` VARCHAR(191) NULL,

    UNIQUE INDEX `Like_userId_artworkId_key`(`userId`, `artworkId`),
    UNIQUE INDEX `Like_userId_artistId_key`(`userId`, `artistId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommissionMessage` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `commissionRequestId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,

    INDEX `CommissionMessage_commissionRequestId_idx`(`commissionRequestId`),
    INDEX `CommissionMessage_senderId_idx`(`senderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable: CommissionRequest — add artistId
ALTER TABLE `CommissionRequest` ADD COLUMN `artistId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `CommissionRequest_artistId_idx` ON `CommissionRequest`(`artistId`);

-- AlterTable: Order status — add PENDING_DELIVERY value
ALTER TABLE `Order` MODIFY `status` ENUM('PENDING', 'PAID', 'PENDING_DELIVERY', 'FULFILLED', 'CANCELED') NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_artworkId_fkey` FOREIGN KEY (`artworkId`) REFERENCES `Artwork`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_artworkId_fkey` FOREIGN KEY (`artworkId`) REFERENCES `Artwork`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionMessage` ADD CONSTRAINT `CommissionMessage_commissionRequestId_fkey` FOREIGN KEY (`commissionRequestId`) REFERENCES `CommissionRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionMessage` ADD CONSTRAINT `CommissionMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionRequest` ADD CONSTRAINT `CommissionRequest_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
