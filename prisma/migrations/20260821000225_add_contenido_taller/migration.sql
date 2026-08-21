-- AlterTable
ALTER TABLE `socios` ADD COLUMN `moodleUserId` INTEGER NULL;

-- AlterTable
ALTER TABLE `talleres` ADD COLUMN `moodleCourseId` INTEGER NULL;

-- CreateTable
CREATE TABLE `contenidos_taller` (
    `id` VARCHAR(191) NOT NULL,
    `tallerId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `tipo` ENUM('DOCUMENTO', 'VIDEO', 'ENLACE') NOT NULL DEFAULT 'DOCUMENTO',
    `url` VARCHAR(191) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contenidos_taller_tallerId_idx`(`tallerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contenidos_taller` ADD CONSTRAINT `contenidos_taller_tallerId_fkey` FOREIGN KEY (`tallerId`) REFERENCES `talleres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
