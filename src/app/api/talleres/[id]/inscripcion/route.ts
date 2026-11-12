import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guardarArchivo, MAX_FILE_SIZE, TIPOS_PERMITIDOS_COMPROBANTE } from "@/lib/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.socioId) {
    return NextResponse.json({ error: "Tenés que iniciar sesión como socio para inscribirte." }, { status: 403 });
  }

  const taller = await prisma.taller.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          inscripciones: {
            where: {
              estado: "CONFIRMADO",
            },
          },
        },
      },
    },
  });

  if (!taller) {
    return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });
  }

  if (taller._count.inscripciones >= taller.cuposTotales) {
    return NextResponse.json({ error: "No quedan cupos disponibles" }, { status: 409 });
  }

  const formData = await request.formData().catch(() => null);
  let comprobanteUrl: string | undefined = undefined;

  if (formData) {
    const file = formData.get("comprobante") as File | null;
    if (file && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "El comprobante supera los 5MB" }, { status: 400 });
      }
      if (!TIPOS_PERMITIDOS_COMPROBANTE.includes(file.type)) {
        return NextResponse.json(
          { error: "Formato de comprobante no admitido (usá JPG, PNG o PDF)" },
          { status: 400 }
        );
      }
      comprobanteUrl = await guardarArchivo(file, "comprobantes-talleres");
    }
  }

  const inscripcion = await prisma.inscripcionTaller.upsert({
    where: {
      tallerId_socioId: { tallerId: taller.id, socioId: session.user.socioId },
    },
    update: {
      estado: "PENDIENTE",
      fechaInscripcion: new Date(),
      ...(comprobanteUrl && { comprobanteUrl }),
    },
    create: {
      tallerId: taller.id,
      socioId: session.user.socioId,
      estado: "PENDIENTE",
      ...(comprobanteUrl && { comprobanteUrl }),
    },
  });

  return NextResponse.json(inscripcion, { status: 201 });
}
