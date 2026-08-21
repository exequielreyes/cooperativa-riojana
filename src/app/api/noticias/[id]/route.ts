import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guardarArchivo, MAX_FILE_SIZE, TIPOS_PERMITIDOS_IMAGEN } from "@/lib/storage";
import { z } from "zod";

const patchSchema = z.object({
  accion: z.enum(["PUBLICAR", "DESPUBLICAR"]).optional(),
  titulo: z.string().min(1).optional(),
  contenido: z.string().min(1).optional(),
  categoria: z.string().min(1).optional(),
  redesSociales: z.array(z.enum(["TIKTOK", "YOUTUBE", "INSTAGRAM", "LINKEDIN"])).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const noticia = await prisma.noticia.findUnique({
    where: { id: params.id },
    include: { redesSociales: true },
  });
  if (!noticia) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(noticia);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }


 const contentType = request.headers.get("content-type") ?? "";
  let accion: "PUBLICAR" | "DESPUBLICAR" | undefined;
  let camposEditables: { titulo?: string; contenido?: string; categoria?: string } = {};
  let redesSociales: ("TIKTOK" | "YOUTUBE" | "INSTAGRAM" | "LINKEDIN")[] | undefined;
  let imagenUrl: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    // Viene del formulario de edición completo: puede incluir una imagen nueva.
    const formData = await request.formData();
    const titulo = formData.get("titulo");
    const contenido = formData.get("contenido");
    const categoria = formData.get("categoria");
    const accionRaw = formData.get("accion");
    const redesRaw = formData.getAll("redesSociales") as string[];
    const imagen = formData.get("imagen");

    if (typeof titulo === "string") camposEditables.titulo = titulo;
    if (typeof contenido === "string") camposEditables.contenido = contenido;
    if (typeof categoria === "string") camposEditables.categoria = categoria;
    if (accionRaw === "PUBLICAR" || accionRaw === "DESPUBLICAR") accion = accionRaw;
    if (formData.has("redesSociales")) {
      redesSociales = redesRaw as ("TIKTOK" | "YOUTUBE" | "INSTAGRAM" | "LINKEDIN")[];
    }

    if (imagen instanceof File && imagen.size > 0) {
      if (imagen.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "La imagen supera los 5MB" }, { status: 400 });
      }
      if (!TIPOS_PERMITIDOS_IMAGEN.includes(imagen.type)) {
        return NextResponse.json({ error: "Formato de imagen no admitido" }, { status: 400 });
      }
      imagenUrl = await guardarArchivo(imagen, "noticias");
    }
  } else {
    // Acciones rápidas (ej: botón Publicar/Despublicar) mandan JSON simple.
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    accion = parsed.data.accion;
    camposEditables = {
      titulo: parsed.data.titulo,
      contenido: parsed.data.contenido,
      categoria: parsed.data.categoria,
    };
    redesSociales = parsed.data.redesSociales;
  }

  // const body = await request.json();
  // const parsed = patchSchema.safeParse(body);
  // if (!parsed.success) {
  //   return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  // }

  // const { accion, redesSociales, ...camposEditables } = parsed.data;

  const noticia = await prisma.noticia.update({
    where: { id: params.id },
    data: {
      ...camposEditables,
      ...(imagenUrl && { imagenUrl }),
      ...(accion === "PUBLICAR" && { estado: "PUBLICADO", fechaPublicacion: new Date() }),
      ...(accion === "DESPUBLICAR" && { estado: "BORRADOR", fechaPublicacion: null }),
      ...(redesSociales && {
        redesSociales: {
          deleteMany: {},
          create: redesSociales.map((redSocial) => ({ redSocial })),
        },
      }),
    },
    include: { redesSociales: true },
  });

  // TODO: si tiene redes sociales seleccionadas, disparar acá la publicación
  // real en cada API (Meta, TikTok, YouTube, LinkedIn) y actualizar
  // NoticiaRedSocial.estadoPublicacion según el resultado de cada una.

  return NextResponse.json(noticia);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.noticia.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
