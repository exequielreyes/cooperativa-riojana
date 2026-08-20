// Uso:
//   npx tsx prisma/crear-cuotas-prueba.ts
//   npx tsx prisma/crear-cuotas-prueba.ts otro-email@ejemplo.com
//
// Por defecto usa el socio de seed (juan.perez@example.com). Le agrega 3
// cuotas nuevas (2 vencidas + 1 pendiente del mes actual) para poder probar
// el selector múltiple de cuotas / "pagar todo junto" en Reportar Pago.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] ?? "juan.perez@example.com";

  const socio = await prisma.socio.findFirst({ where: { email } });
  if (!socio) {
    console.error(`No se encontró ningún socio con email "${email}".`);
    process.exit(1);
  }

  const config = await prisma.configuracionCooperativa.findUnique({ where: { id: "singleton" } });
  const monto = config?.montoCuotaActual ?? 12450;

  const hoy = new Date();
  const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  // 2 meses vencidos + el mes actual, para simular una deuda acumulada real.
  const offsets = [2, 1, 0];

  for (const mesesAtras of offsets) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - mesesAtras, 10);
    const periodo = `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;

    const cuota = await prisma.cuota.create({
      data: {
        socioId: socio.id,
        periodo,
        concepto: "Cuota Social",
        monto,
        fechaVencimiento: fecha,
        estado: fecha < hoy ? "VENCIDO" : "PENDIENTE",
      },
    });

    console.log(`✓ Cuota creada: ${cuota.periodo} — vence ${fecha.toLocaleDateString("es-AR")} — ${cuota.estado}`);
  }

  console.log(`\nListo. ${socio.nombre} ${socio.apellido} (${email}) ahora tiene 3 cuotas nuevas pendientes.`);
  console.log(`Entrá como este socio y probá /portal/pagos/reportar.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());