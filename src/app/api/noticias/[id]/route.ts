import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
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

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { accion, redesSociales, ...camposEditables } = parsed.data;

  const noticia = await prisma.noticia.update({
    where: { id: params.id },
    data: {
      ...camposEditables,
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
