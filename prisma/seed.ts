import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("cambiar123", 10);

  // --- Usuario admin ---
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@cooperativa.com" },
    update: {},
    create: {
      email: "admin@cooperativa.com",
      passwordHash,
      rol: "SUPER_ADMIN",
    },
  });

  // --- Usuario + Socio de prueba ---
  const usuarioSocio = await prisma.usuario.upsert({
    where: { email: "juan.perez@example.com" },
    update: {},
    create: {
      email: "juan.perez@example.com",
      passwordHash,
      rol: "SOCIO",
    },
  });

  const socio = await prisma.socio.upsert({
    where: { usuarioId: usuarioSocio.id },
    update: {},
    create: {
      usuarioId: usuarioSocio.id,
      nombre: "Juan",
      apellido: "Pérez",
      dni: "30111222",
      email: "juan.perez@example.com",
      idCooperativa: "CR-2024-0001",
      tipoMiembro: "PRODUCTOR",
      estado: "ACTIVO",
      region: "Rioja Alta",
    },
  });

  // --- Cuota pendiente para ese socio ---
  await prisma.cuota.upsert({
    where: { id: "seed-cuota-marzo-2024" },
    update: {},
    create: {
      id: "seed-cuota-marzo-2024",
      socioId: socio.id,
      periodo: "Marzo 2024",
      monto: 12450,
      fechaVencimiento: new Date("2024-03-10"),
      estado: "PENDIENTE",
    },
  });

  // --- Taller de ejemplo ---
  await prisma.taller.upsert({
    where: { slug: "memoria-activa" },
    update: {},
    create: {
      titulo: "Taller de Memoria Activa",
      slug: "memoria-activa",
      descripcion: "Ejercicios cognitivos y dinámicas grupales para fortalecer la memoria y la atención en adultos mayores.",
      categoria: "Salud",
      instructor: "Lic. Marta Rodríguez",
      ubicacion: "Salón Comunitario Central",
      modalidad: "PRESENCIAL",
      fecha: new Date("2024-05-15"),
      horaInicio: "17:00",
      horaFin: "19:00",
      cuposTotales: 8,
      materialUrl: "https://drive.google.com/example-material-memoria-activa",
    },
  });

  // --- Noticia de ejemplo, publicada en Instagram y LinkedIn ---
  await prisma.noticia.upsert({
    where: { slug: "nueva-inversion-tecnologica" },
    update: {},
    create: {
      titulo: "Nueva Inversión Tecnológica en la Planta de Procesamiento de Vid",
      slug: "nueva-inversion-tecnologica",
      contenido: "La Cooperativa Riojana reafirma su compromiso con la excelencia mediante la adquisición de maquinaria de última generación.",
      categoria: "Producción",
      estado: "PUBLICADO",
      fechaPublicacion: new Date("2024-05-15"),
      autorId: admin.id,
      redesSociales: {
        create: [{ redSocial: "INSTAGRAM" }, { redSocial: "LINKEDIN" }],
      },
    },
  });

  // --- Configuración general ---
  await prisma.configuracionCooperativa.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      montoCuotaActual: 12450,
      cbu: "0000003100012345678901",
      alias: "COOP.RIOJANA.MP",
    },
  });

  console.log("Seed completo.");
  console.log("Admin -> admin@cooperativa.com / cambiar123");
  console.log("Socio -> juan.perez@example.com / cambiar123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
