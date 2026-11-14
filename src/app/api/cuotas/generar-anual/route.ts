import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

// Buscador de socios activos para generar cuota anual
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const currentArea = cookies().get("coop_area")?.value || "SEPELIO";

  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const mesActualIndex = hoy.getMonth();
  // Contempla desde el mes actual inclusive hasta diciembre (ej: en noviembre 12 - 10 = 2 meses: noviembre y diciembre)
  const totalMesesHastaFinDeAnio = 12 - mesActualIndex;
  const inicioMesActual = new Date(anioActual, mesActualIndex, 1);
  const finAnio = new Date(anioActual, 11, 31, 23, 59, 59);
  const periodoAnual = `Año ${anioActual}`;

  const socios = await prisma.socio.findMany({
    where: {
      estado: "ACTIVO",
      area: currentArea as any,
      OR: [
        { nombre: { contains: q } },
        { apellido: { contains: q } },
        { dni: { contains: q } },
        { idCooperativa: { contains: q } },
      ],
    },
    include: {
      cuotas: {
        where: {
          OR: [
            { concepto: { startsWith: "Cuota Anual" } },
            {
              concepto: "Cuota Social",
              estado: "PAGADO",
              fechaVencimiento: { gte: inicioMesActual, lte: finAnio },
            },
          ],
        },
        orderBy: { createdAt: "desc" },
      },
    },
    take: 8,
  });

  const resultado = socios.map((s) => {
    const tieneAnualEsteAnio = s.cuotas.some(
      (c) =>
        c.concepto.startsWith("Cuota Anual") &&
        (c.periodo === periodoAnual || new Date(c.createdAt).getFullYear() === anioActual)
    );

    const cuotasMensualesPagadas = s.cuotas.filter(
      (c) => c.concepto === "Cuota Social" && c.estado === "PAGADO"
    ).length;

    const mesesRestantes = Math.max(0, totalMesesHastaFinDeAnio - cuotasMensualesPagadas);
    const tieneAnualVigente = tieneAnualEsteAnio || mesesRestantes === 0;

    return {
      id: s.id,
      nombre: s.nombre,
      apellido: s.apellido,
      dni: s.dni,
      idCooperativa: s.idCooperativa,
      tieneAnualVigente,
      mesesRestantes,
    };
  });

  return NextResponse.json(resultado);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const socioId = body?.socioId as string | undefined;

  if (!socioId) {
    return NextResponse.json(
      { error: "Debés seleccionar un socio activo." },
      { status: 400 }
    );
  }

  const socio = await prisma.socio.findUnique({
    where: { id: socioId },
  });

  if (!socio || socio.estado !== "ACTIVO") {
    return NextResponse.json(
      { error: "El socio seleccionado no existe o no está activo." },
      { status: 404 }
    );
  }

  const configuracion = await prisma.configuracionCooperativa.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const mesActualIndex = hoy.getMonth();

  // Incluye el mes actual hasta fin de año (ej. si estamos en enero son 12 meses, en noviembre son 2: nov y dic)
  const totalMesesHastaFinDeAnio = 12 - mesActualIndex;
  const inicioMesActual = new Date(anioActual, mesActualIndex, 1);
  const finAnio = new Date(anioActual, 11, 31, 23, 59, 59);
  const periodo = `Año ${anioActual}`;
  const fechaVencimiento = new Date(anioActual, 11, 31);

  // Verificar si ya tiene una cuota anual generada para este año
  const yaTieneAnual = await prisma.cuota.findFirst({
    where: {
      socioId: socio.id,
      concepto: { startsWith: "Cuota Anual" },
      OR: [
        { periodo },
        { createdAt: { gte: new Date(anioActual, 0, 1), lte: finAnio } },
      ],
    },
  });

  if (yaTieneAnual) {
    return NextResponse.json(
      { error: `Este socio ya tiene generada la cuota anual para el ${periodo}.` },
      { status: 409 }
    );
  }

  // Si ya se le había generado una cuota mensual PENDIENTE/VENCIDA del mes actual (sin pagos en revisión ni aprobados),
  // la eliminamos para que la Cuota Anual contemple el mes actual sin cobrarle doble la cuota del mes.
  const cuotasMensualesNoPagadasDesdeEsteMes = await prisma.cuota.findMany({
    where: {
      socioId: socio.id,
      concepto: "Cuota Social",
      estado: { in: ["PENDIENTE", "VENCIDO"] },
      fechaVencimiento: { gte: inicioMesActual, lte: finAnio },
      pagos: {
        none: {
          estadoValidacion: { in: ["PENDIENTE_REVISION", "APROBADO"] },
        },
      },
    },
    select: { id: true },
  });

  if (cuotasMensualesNoPagadasDesdeEsteMes.length > 0) {
    await prisma.cuota.deleteMany({
      where: {
        id: { in: cuotasMensualesNoPagadasDesdeEsteMes.map((c) => c.id) },
      },
    });
  }

  // Contar sólo cuotas mensuales que ya hayan sido PAGADAS o estén en revisión desde este mes hasta fin de año
  const cuotasYaCubiertasDesdeEsteMes = await prisma.cuota.count({
    where: {
      socioId: socio.id,
      concepto: "Cuota Social",
      fechaVencimiento: { gte: inicioMesActual, lte: finAnio },
    },
  });

  const mesesRestantes = Math.max(0, totalMesesHastaFinDeAnio - cuotasYaCubiertasDesdeEsteMes);

  if (mesesRestantes === 0) {
    return NextResponse.json(
      { error: "Este socio ya tiene todas las cuotas de este año cubiertas." },
      { status: 409 }
    );
  }

  const montoAnual = Number(configuracion.montoCuotaActual) * mesesRestantes;

  const cuota = await prisma.cuota.create({
    data: {
      socioId: socio.id,
      periodo,
      concepto: `Cuota Anual (${mesesRestantes} ${mesesRestantes === 1 ? "mes" : "meses"} restantes)`,
      monto: montoAnual,
      fechaVencimiento,
      estado: "PENDIENTE",
    },
  });

  return NextResponse.json({
    generadas: 1,
    periodo,
    mesesRestantes,
    montoTotal: montoAnual,
    socio: `${socio.nombre} ${socio.apellido}`,
    cuota,
  });
}
