import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const currentArea = cookies().get("coop_area")?.value || "SEPELIO";

  const socios = await prisma.socio.findMany({
    where: {
      estado: "ACTIVO",
      area: currentArea as any,
      cuotas: { some: { estado: { in: ["PENDIENTE", "VENCIDO"] } } },
      OR: [
        { nombre: { contains: q } },
        { apellido: { contains: q } },
        { dni: { contains: q } },
        { idCooperativa: { contains: q } },
      ],
    },
    include: {
      cuotas: {
        where: { estado: { in: ["PENDIENTE", "VENCIDO"] } },
        orderBy: { fechaVencimiento: "asc" },
      },
    },
    take: 8,
  });

  const resultado = socios.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    apellido: s.apellido,
    idCooperativa: s.idCooperativa,
    cuotas: s.cuotas.map((c) => ({
      id: c.id,
      periodo: c.periodo,
      monto: Number(c.monto),
      fechaVencimiento: c.fechaVencimiento.toISOString(),
    })),
  }));

  return NextResponse.json(resultado);
}