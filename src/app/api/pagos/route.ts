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
  const cuotaId = formData.get("cuotaId");
  const metodo = formData.get("metodo");
  const comprobante = formData.get("comprobante");

  if (typeof cuotaId !== "string" || typeof metodo !== "string") {
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

  const cuota = await prisma.cuota.findUnique({ where: { id: cuotaId } });
  if (!cuota || cuota.socioId !== session.user.socioId) {
    return NextResponse.json({ error: "Cuota inválida" }, { status: 404 });
  }

  const comprobanteUrl = await guardarArchivo(comprobante, "comprobantes");

  const pago = await prisma.pago.create({
    data: {
      cuotaId: cuota.id,
      socioId: session.user.socioId,
      monto: cuota.monto,
      metodo: metodo as "TRANSFERENCIA" | "EFECTIVO" | "MERCADOPAGO",
      comprobanteUrl,
      estadoValidacion: "PENDIENTE_REVISION",
    },
  });

  return NextResponse.json(pago, { status: 201 });
}
