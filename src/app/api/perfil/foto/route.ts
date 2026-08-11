import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guardarArchivo, MAX_FILE_SIZE, TIPOS_PERMITIDOS_IMAGEN } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const foto = formData.get("foto");

  if (!(foto instanceof File) || foto.size === 0) {
    return NextResponse.json({ error: "Adjuntá una imagen" }, { status: 400 });
  }
  if (foto.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "La imagen supera los 5MB" }, { status: 400 });
  }
  if (!TIPOS_PERMITIDOS_IMAGEN.includes(foto.type)) {
    return NextResponse.json({ error: "Formato no admitido (usá JPG, PNG o WEBP)" }, { status: 400 });
  }

  const fotoUrl = await guardarArchivo(foto, "perfiles");

  const socio = await prisma.socio.update({
    where: { id: session.user.socioId },
    data: { fotoUrl },
  });

  return NextResponse.json(socio);
}
