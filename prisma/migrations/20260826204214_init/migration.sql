-- CreateTable
CREATE TABLE `preguntas_frecuentes` (
    `id` VARCHAR(191) NOT NULL,
    `pregunta` VARCHAR(191) NOT NULL,
    `respuesta` TEXT NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `pagos_cuotaId_idx` ON `pagos`(`cuotaId`);
