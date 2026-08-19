import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guardarArchivo, MAX_FILE_SIZE, TIPOS_PERMITIDOS_COMPROBANTE } from "@/lib/storage";

export async function GET() {
  const pagos = await prisma.pago.findMany({
    include: { socio: true, cuota: true },
    orderBy: { fechaPago: "desc" },
    take: 50,
  });
  return NextResponse.json(pagos);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  // Puede venir una o varias cuotas (checkboxes en el form de "Reportar Pago").
  const cuotaIds = formData.getAll("cuotaId").filter((v): v is string => typeof v === "string" && v.length > 0);
  const metodo = formData.get("metodo");
  const comprobante = formData.get("comprobante");

  if (cuotaIds.length === 0 || typeof metodo !== "string") {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }
  if (!(comprobante instanceof File) || comprobante.size === 0) {
    return NextResponse.json({ error: "Adjuntá un comprobante" }, { status: 400 });
  }
  if (comprobante.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "El archivo supera los 5MB" }, { status: 400 });
  }
  if (!TIPOS_PERMITIDOS_COMPROBANTE.includes(comprobante.type)) {
    return NextResponse.json({ error: "Formato no admitido (usá JPG, PNG o PDF)" }, { status: 400 });
  }

  const cuotas = await prisma.cuota.findMany({
    where: { id: { in: cuotaIds }, socioId: session.user.socioId },
    include: { pago: true },
  });

  // Todas las cuotas pedidas tienen que existir, ser del socio logueado,
  // y no tener ya un pago registrado (Pago.cuotaId es único).
  if (cuotas.length !== cuotaIds.length) {
    return NextResponse.json({ error: "Alguna cuota seleccionada no es válida" }, { status: 404 });
  }
  if (cuotas.some((c) => c.pago)) {
    return NextResponse.json(
      { error: "Una de las cuotas seleccionadas ya tiene un pago registrado. Actualizá la página e intentá de nuevo." },
      { status: 409 }
    );
  }

  const comprobanteUrl = await guardarArchivo(comprobante, "comprobantes");

  // Un Pago por cuota (mismo comprobante y método para todas), en una sola transacción.
  const pagos = await prisma.$transaction(
    cuotas.map((cuota) =>
      prisma.pago.create({
        data: {
          cuotaId: cuota.id,
          socioId: session.user.socioId!,
          monto: cuota.monto,
          metodo: metodo as "TRANSFERENCIA" | "EFECTIVO" | "MERCADOPAGO",
          comprobanteUrl,
          estadoValidacion: "PENDIENTE_REVISION",
        },
      })
    )
  );

  return NextResponse.json(pagos, { status: 201 });
}