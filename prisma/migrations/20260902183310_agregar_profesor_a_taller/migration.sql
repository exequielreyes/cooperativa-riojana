-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `rol` ENUM('SOCIO', 'SUPER_ADMIN', 'EDITOR_CONTENIDOS', 'PROFESOR') NOT NULL DEFAULT 'SOCIO',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `socios` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `dni` VARCHAR(191) NOT NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `idCooperativa` VARCHAR(191) NOT NULL,
    `tipoMiembro` ENUM('PRODUCTOR', 'ADHERENTE', 'HONORARIO') NOT NULL DEFAULT 'PRODUCTOR',
    `estado` ENUM('ACTIVO', 'PENDIENTE', 'INACTIVO') NOT NULL DEFAULT 'PENDIENTE',
    `motivoBaja` VARCHAR(191) NULL,
    `fotoUrl` VARCHAR(191) NULL,
    `moodleUserId` INTEGER NULL,
    `cuotasCapital` INTEGER NOT NULL DEFAULT 1,
    `montoCapital` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `socios_usuarioId_key`(`usuarioId`),
    UNIQUE INDEX `socios_dni_key`(`dni`),
    UNIQUE INDEX `socios_idCooperativa_key`(`idCooperativa`),
    INDEX `socios_region_idx`(`region`),
    INDEX `socios_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grupo_familiar` (
    `id` VARCHAR(191) NOT NULL,
    `socioId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `dni` VARCHAR(191) NULL,
    `parentesco` VARCHAR(191) NOT NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `email` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `grupo_familiar_socioId_idx`(`socioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuracion_cooperativa` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `montoCuotaActual` DECIMAL(10, 2) NOT NULL DEFAULT 12450,
    `montoCapitalActual` DECIMAL(10, 2) NOT NULL DEFAULT 50000,
    `cbu` VARCHAR(191) NULL,
    `alias` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatbot_respuestas` (
    `id` VARCHAR(191) NOT NULL,
    `pregunta` VARCHAR(191) NULL,
    `palabrasClave` TEXT NOT NULL,
    `respuesta` TEXT NOT NULL,
    `link` VARCHAR(191) NULL,
    `linkTexto` VARCHAR(191) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cuotas` (
    `id` VARCHAR(191) NOT NULL,
    `socioId` VARCHAR(191) NOT NULL,
    `periodo` VARCHAR(191) NOT NULL,
    `concepto` VARCHAR(191) NOT NULL DEFAULT 'Cuota Social',
    `monto` DECIMAL(10, 2) NOT NULL,
    `fechaVencimiento` DATETIME(3) NOT NULL,
    `estado` ENUM('PENDIENTE', 'PAGADO', 'VENCIDO') NOT NULL DEFAULT 'PENDIENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cuotas_socioId_estado_idx`(`socioId`, `estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagos` (
    `id` VARCHAR(191) NOT NULL,
    `cuotaId` VARCHAR(191) NOT NULL,
    `socioId` VARCHAR(191) NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `metodo` ENUM('TRANSFERENCIA', 'EFECTIVO', 'MERCADOPAGO') NOT NULL,
    `comprobanteUrl` VARCHAR(191) NULL,
    `estadoValidacion` ENUM('PENDIENTE_REVISION', 'APROBADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE_REVISION',
    `fechaPago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `validadoPorId` VARCHAR(191) NULL,
    `fechaValidacion` DATETIME(3) NULL,
    `notaRechazo` VARCHAR(191) NULL,

    INDEX `pagos_socioId_idx`(`socioId`),
    INDEX `pagos_estadoValidacion_idx`(`estadoValidacion`),
    INDEX `pagos_cuotaId_idx`(`cuotaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `talleres` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `instructor` VARCHAR(191) NULL,
    `profesorId` VARCHAR(191) NULL,
    `ubicacion` VARCHAR(191) NULL,
    `modalidad` ENUM('PRESENCIAL', 'VIRTUAL') NOT NULL DEFAULT 'PRESENCIAL',
    `fecha` DATETIME(3) NOT NULL,
    `horaInicio` VARCHAR(191) NOT NULL,
    `horaFin` VARCHAR(191) NULL,
    `cuposTotales` INTEGER NOT NULL,
    `imagenUrl` VARCHAR(191) NULL,
    `requisitos` TEXT NULL,
    `queAprenderas` TEXT NULL,
    `materialUrl` VARCHAR(191) NULL,
    `moodleCourseId` INTEGER NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'ACTIVO',
    `esPago` BOOLEAN NOT NULL DEFAULT false,
    `precio` DECIMAL(10, 2) NULL,
    `descuento` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `talleres_slug_key`(`slug`),
    INDEX `talleres_fecha_idx`(`fecha`),
    INDEX `talleres_profesorId_idx`(`profesorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inscripciones_talleres` (
    `id` VARCHAR(191) NOT NULL,
    `tallerId` VARCHAR(191) NOT NULL,
    `socioId` VARCHAR(191) NOT NULL,
    `estado` ENUM('PENDIENTE', 'CONFIRMADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `observaciones` VARCHAR(191) NULL,
    `comprobanteUrl` VARCHAR(191) NULL,
    `fechaInscripcion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `inscripciones_talleres_tallerId_socioId_key`(`tallerId`, `socioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `noticias` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `contenido` TEXT NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `imagenUrl` VARCHAR(191) NULL,
    `estado` ENUM('BORRADOR', 'PUBLICADO', 'PROGRAMADO') NOT NULL DEFAULT 'BORRADOR',
    `autorId` VARCHAR(191) NOT NULL,
    `fechaPublicacion` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `noticias_slug_key`(`slug`),
    INDEX `noticias_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `noticia_redes_sociales` (
    `id` VARCHAR(191) NOT NULL,
    `noticiaId` VARCHAR(191) NOT NULL,
    `redSocial` ENUM('TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'LINKEDIN') NOT NULL,
    `estadoPublicacion` ENUM('PENDIENTE', 'PUBLICADO', 'ERROR') NOT NULL DEFAULT 'PENDIENTE',
    `urlPublicacion` VARCHAR(191) NULL,
    `fechaPublicacion` DATETIME(3) NULL,

    UNIQUE INDEX `noticia_redes_sociales_noticiaId_redSocial_key`(`noticiaId`, `redSocial`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `contenido_nosotros` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `heroBadge` TEXT NOT NULL,
    `heroTitulo` TEXT NOT NULL,
    `heroDescripcion` TEXT NOT NULL,
    `heroBotonTexto` TEXT NOT NULL,
    `heroImagenUrl` VARCHAR(191) NULL,
    `textoMision` TEXT NOT NULL,
    `textoVision` TEXT NOT NULL,
    `valores` JSON NOT NULL,
    `origenesLabel` TEXT NOT NULL,
    `origenesTitulo` TEXT NOT NULL,
    `origenesParrafo1` TEXT NOT NULL,
    `origenesParrafo2` TEXT NOT NULL,
    `origenesParrafo3` TEXT NOT NULL,
    `origenesImagenUrl` VARCHAR(191) NULL,
    `origenesBadgeNumero` TEXT NOT NULL,
    `origenesBadgeTexto` TEXT NOT NULL,
    `origenesHito1Titulo` TEXT NOT NULL,
    `origenesHito1Texto` TEXT NOT NULL,
    `origenesHito2Titulo` TEXT NOT NULL,
    `origenesHito2Texto` TEXT NOT NULL,
    `compromisoTitulo` TEXT NOT NULL,
    `compromisoDescripcion` TEXT NOT NULL,
    `iniciativas` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_tokenHash_key`(`tokenHash`),
    INDEX `password_reset_tokens_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificaciones` (
    `id` VARCHAR(191) NOT NULL,
    `socioId` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `mensaje` TEXT NOT NULL,
    `link` VARCHAR(191) NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notificaciones_socioId_leida_idx`(`socioId`, `leida`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `socios` ADD CONSTRAINT `socios_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupo_familiar` ADD CONSTRAINT `grupo_familiar_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cuotas` ADD CONSTRAINT `cuotas_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_cuotaId_fkey` FOREIGN KEY (`cuotaId`) REFERENCES `cuotas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_validadoPorId_fkey` FOREIGN KEY (`validadoPorId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `talleres` ADD CONSTRAINT `talleres_profesorId_fkey` FOREIGN KEY (`profesorId`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones_talleres` ADD CONSTRAINT `inscripciones_talleres_tallerId_fkey` FOREIGN KEY (`tallerId`) REFERENCES `talleres`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones_talleres` ADD CONSTRAINT `inscripciones_talleres_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `noticias` ADD CONSTRAINT `noticias_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `noticia_redes_sociales` ADD CONSTRAINT `noticia_redes_sociales_noticiaId_fkey` FOREIGN KEY (`noticiaId`) REFERENCES `noticias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contenidos_taller` ADD CONSTRAINT `contenidos_taller_tallerId_fkey` FOREIGN KEY (`tallerId`) REFERENCES `talleres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
