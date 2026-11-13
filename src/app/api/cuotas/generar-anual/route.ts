import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Buscador de socios activos para generar cuota anual
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const currentArea = cookies().get("coop_area")?.value || "SEPELIO";

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
        where: { concepto: { startsWith: "Cuota Anual" } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    take: 8,
  });

  const hoy = new Date();
  const mesActualStart = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const resultado = socios.map((s) => {
    const ultimaAnual = s.cuotas[0];
    let tieneAnualVigente = false;

    if (ultimaAnual) {
      if (ultimaAnual.estado === "PENDIENTE" || ultimaAnual.estado === "VENCIDO") {
        tieneAnualVigente = true;
      } else if (ultimaAnual.estado === "PAGADO") {
        const fechaBase = new Date(ultimaAnual.createdAt);
        const finCobertura = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 12, 1);
        if (mesActualStart < finCobertura) {
          tieneAnualVigente = true;
        }
      }
    }

    return {
      id: s.id,
      nombre: s.nombre,
      apellido: s.apellido,
      dni: s.dni,
      idCooperativa: s.idCooperativa,
      tieneAnualVigente,
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
  const mesActualStart = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  // Verificar si ya tiene una cuota anual pendiente o una cuota anual pagada cuyos 12 meses aún no se cumplieron
  const cuotasAnualesPrevias = await prisma.cuota.findMany({
    where: {
      socioId,
      concepto: { startsWith: "Cuota Anual" },
    },
    orderBy: { createdAt: "desc" },
  });

  for (const c of cuotasAnualesPrevias) {
    if (c.estado === "PENDIENTE" || c.estado === "VENCIDO") {
      return NextResponse.json(
        { error: "Este socio ya tiene una cuota anual pendiente de pago." },
        { status: 409 }
      );
    }
    if (c.estado === "PAGADO") {
      const fechaBase = new Date(c.createdAt);
      const finCobertura = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 12, 1);
      if (mesActualStart < finCobertura) {
        return NextResponse.json(
          { error: "Este socio ya cuenta con una cuota anual vigente (no se cumplieron los 12 meses)." },
          { status: 409 }
        );
      }
    }
  }

  const mesInicio = `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;
  const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 11, 1);
  const mesFin = `${MESES[fechaFin.getMonth()]} ${fechaFin.getFullYear()}`;
  const periodo = `${mesInicio} - ${mesFin}`;
  const fechaVencimiento = new Date(hoy.getFullYear(), hoy.getMonth(), 10);
  const montoAnual = Number(configuracion.montoCuotaActual) * 12;

  const cuota = await prisma.cuota.create({
    data: {
      socioId: socio.id,
      periodo,
      concepto: "Cuota Anual (12 meses)",
      monto: montoAnual,
      fechaVencimiento,
      estado: "PENDIENTE",
    },
  });

  return NextResponse.json({
    generadas: 1,
    periodo,
    socio: `${socio.nombre} ${socio.apellido}`,
    cuota,
  });
}
