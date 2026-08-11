import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guardarArchivo, MAX_FILE_SIZE, TIPOS_PERMITIDOS_IMAGEN } from "@/lib/storage";

export async function GET() {
  const noticias = await prisma.noticia.findMany({
    where: { estado: "PUBLICADO" },
    orderBy: { fechaPublicacion: "desc" },
    include: { redesSociales: true },
  });
  return NextResponse.json(noticias);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const titulo = formData.get("titulo");
  const contenido = formData.get("contenido");
  const categoria = formData.get("categoria");
  const estadoDeseado = formData.get("estado"); // "BORRADOR" | "PUBLICADO"
  const redesSociales = formData.getAll("redesSociales") as string[];
  const imagen = formData.get("imagen");

  if (typeof titulo !== "string" || typeof contenido !== "string" || typeof categoria !== "string") {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  let imagenUrl: string | undefined;
  if (imagen instanceof File && imagen.size > 0) {
    if (imagen.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "La imagen supera los 5MB" }, { status: 400 });
    }
    if (!TIPOS_PERMITIDOS_IMAGEN.includes(imagen.type)) {
      return NextResponse.json({ error: "Formato de imagen no admitido" }, { status: 400 });
    }
    imagenUrl = await guardarArchivo(imagen, "noticias");
  }

  const slug = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const publicar = estadoDeseado === "PUBLICADO";

  const noticia = await prisma.noticia.create({
    data: {
      titulo,
      contenido,
      categoria,
      slug,
      imagenUrl,
      estado: publicar ? "PUBLICADO" : "BORRADOR",
      fechaPublicacion: publicar ? new Date() : null,
      autorId: session.user.id,
      redesSociales: {
        create: redesSociales.map((redSocial) => ({
          redSocial: redSocial as "TIKTOK" | "YOUTUBE" | "INSTAGRAM" | "LINKEDIN",
        })),
      },
    },
    include: { redesSociales: true },
  });

  return NextResponse.json(noticia, { status: 201 });
}
