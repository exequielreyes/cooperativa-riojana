import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const crearAsociadoSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  dni: z.string().optional(),
  parentesco: z.string().min(1),
  fechaNacimiento: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const socioIdParam = searchParams.get("socioId");
  const incluirBajas = searchParams.get("incluirBajas") === "true";

  // Si se especifica socioId diferente, debe ser admin
  let socioId = session.user.socioId;
  if (socioIdParam) {
    if (session.user.rol === "SOCIO" && socioIdParam !== session.user.socioId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    socioId = socioIdParam;
  }

  if (!socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const asociados = await prisma.grupoFamiliar.findMany({
    where: {
      socioId,
      ...(incluirBajas ? {} : { activo: true }),
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(asociados);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = crearAsociadoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let socioId = session.user.socioId;
  if (body.socioId && session.user.rol !== "SOCIO") {
    socioId = body.socioId;
  }

  if (!socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { fechaNacimiento, ...rest } = parsed.data;
  const dataToSave = {
    ...rest,
    socioId,
    fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
    activo: true,
  };

  const asociado = await prisma.grupoFamiliar.create({
    data: dataToSave,
  });

  return NextResponse.json(asociado, { status: 201 });
}
