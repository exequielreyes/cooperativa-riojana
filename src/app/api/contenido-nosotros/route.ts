import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guardarArchivo, MAX_FILE_SIZE, TIPOS_PERMITIDOS_IMAGEN } from "@/lib/storage";
import {
  CONTENIDO_NOSOTROS_DEFAULT,
  type ValorInstitucional,
  type IniciativaSocial,
} from "@/lib/contenidoNosotrosDefault";

function esEditor(rol?: string) {
  return rol === "SUPER_ADMIN" || rol === "EDITOR_CONTENIDOS";
}

export async function GET() {
  const contenido = await prisma.contenidoNosotros.upsert({
    where: { id: "singleton" },
    update: {},
    create: CONTENIDO_NOSOTROS_DEFAULT,
  });
  return NextResponse.json(contenido);
}

async function subirImagenSiViene(
  formData: FormData,
  campo: string,
  carpeta: string
): Promise<string | undefined> {
  const archivo = formData.get(campo);
  if (!(archivo instanceof File) || archivo.size === 0) return undefined;

  if (archivo.size > MAX_FILE_SIZE) {
    throw new Error(`La imagen "${campo}" supera los 5MB`);
  }
  if (!TIPOS_PERMITIDOS_IMAGEN.includes(archivo.type)) {
    throw new Error(`La imagen "${campo}" tiene un formato no admitido`);
  }
  return guardarArchivo(archivo, carpeta);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!esEditor(session?.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();

  const campoTexto = (nombre: string) => {
    const valor = formData.get(nombre);
    return typeof valor === "string" ? valor : undefined;
  };

  let heroImagenUrl: string | undefined;
  let origenesImagenUrl: string | undefined;
  let iniciativaImagenUrl: (string | undefined)[];

  try {
    heroImagenUrl = await subirImagenSiViene(formData, "heroImagen", "nosotros");
    origenesImagenUrl = await subirImagenSiViene(formData, "origenesImagen", "nosotros");
    iniciativaImagenUrl = await Promise.all([
      subirImagenSiViene(formData, "iniciativa0Imagen", "nosotros"),
      subirImagenSiViene(formData, "iniciativa1Imagen", "nosotros"),
      subirImagenSiViene(formData, "iniciativa2Imagen", "nosotros"),
    ]);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo subir una imagen";
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }

  // valores e iniciativas viajan como JSON serializado dentro del FormData
  let valores: ValorInstitucional[] | undefined;
  let iniciativas: IniciativaSocial[] | undefined;

  const valoresRaw = campoTexto("valores");
  if (valoresRaw) {
    try {
      valores = JSON.parse(valoresRaw);
    } catch {
      return NextResponse.json({ error: "Formato inválido en 'valores'" }, { status: 400 });
    }
  }

  const iniciativasRaw = campoTexto("iniciativas");
  if (iniciativasRaw) {
    try {
      iniciativas = JSON.parse(iniciativasRaw);
    } catch {
      return NextResponse.json({ error: "Formato inválido en 'iniciativas'" }, { status: 400 });
    }
  }

  // Si se subió una imagen nueva para alguna iniciativa, pisamos esa url
  // puntual dentro del array (el resto de cada objeto ya viene en el JSON).
  if (iniciativas) {
    iniciativas = iniciativas.map((item, index) => ({
      ...item,
      imagenUrl: iniciativaImagenUrl[index] ?? item.imagenUrl ?? null,
    }));
  }

  const data = {
    ...(campoTexto("heroBadge") !== undefined && { heroBadge: campoTexto("heroBadge") }),
    ...(campoTexto("heroTitulo") !== undefined && { heroTitulo: campoTexto("heroTitulo") }),
    ...(campoTexto("heroDescripcion") !== undefined && { heroDescripcion: campoTexto("heroDescripcion") }),
    ...(campoTexto("heroBotonTexto") !== undefined && { heroBotonTexto: campoTexto("heroBotonTexto") }),
    ...(heroImagenUrl && { heroImagenUrl }),

    ...(campoTexto("textoMision") !== undefined && { textoMision: campoTexto("textoMision") }),
    ...(campoTexto("textoVision") !== undefined && { textoVision: campoTexto("textoVision") }),
    ...(valores && { valores }),

    ...(campoTexto("origenesLabel") !== undefined && { origenesLabel: campoTexto("origenesLabel") }),
    ...(campoTexto("origenesTitulo") !== undefined && { origenesTitulo: campoTexto("origenesTitulo") }),
    ...(campoTexto("origenesParrafo1") !== undefined && { origenesParrafo1: campoTexto("origenesParrafo1") }),
    ...(campoTexto("origenesParrafo2") !== undefined && { origenesParrafo2: campoTexto("origenesParrafo2") }),
    ...(campoTexto("origenesParrafo3") !== undefined && { origenesParrafo3: campoTexto("origenesParrafo3") }),
    ...(origenesImagenUrl && { origenesImagenUrl }),
    ...(campoTexto("origenesBadgeNumero") !== undefined && { origenesBadgeNumero: campoTexto("origenesBadgeNumero") }),
    ...(campoTexto("origenesBadgeTexto") !== undefined && { origenesBadgeTexto: campoTexto("origenesBadgeTexto") }),
    ...(campoTexto("origenesHito1Titulo") !== undefined && { origenesHito1Titulo: campoTexto("origenesHito1Titulo") }),
    ...(campoTexto("origenesHito1Texto") !== undefined && { origenesHito1Texto: campoTexto("origenesHito1Texto") }),
    ...(campoTexto("origenesHito2Titulo") !== undefined && { origenesHito2Titulo: campoTexto("origenesHito2Titulo") }),
    ...(campoTexto("origenesHito2Texto") !== undefined && { origenesHito2Texto: campoTexto("origenesHito2Texto") }),

    ...(campoTexto("compromisoTitulo") !== undefined && { compromisoTitulo: campoTexto("compromisoTitulo") }),
    ...(campoTexto("compromisoDescripcion") !== undefined && { compromisoDescripcion: campoTexto("compromisoDescripcion") }),
    ...(iniciativas && { iniciativas }),
  };

  const contenido = await prisma.contenidoNosotros.upsert({
    where: { id: "singleton" },
    update: data,
    create: { ...CONTENIDO_NOSOTROS_DEFAULT, ...data },
  });

  return NextResponse.json(contenido);
}
