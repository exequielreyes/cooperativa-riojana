import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const TIPOS_PERMITIDOS_COMPROBANTE = ["image/jpeg", "image/png", "application/pdf"];
export const TIPOS_PERMITIDOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];

const EXTENSIONES_PERMITIDAS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "pdf",
  "docx",
  "pptx",
  "xlsx",
]);

const MIME_A_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

/**
 * Guarda un archivo en /public/uploads/<carpeta>/ y devuelve la URL pública.
 * Sanitiza la ruta para evitar path traversal y asegura extensiones no ejecutables.
 */
export async function guardarArchivo(archivo: File, carpeta: string): Promise<string> {
  const bytes = await archivo.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Sanitizar carpeta para prevenir directory traversal
  const carpetaSanitizada = carpeta
    .replace(/\\/g, "/")
    .replace(/\.\./g, "")
    .replace(/^\/+|\/+$/g, "");

  // Mapear extensión desde el MIME validado o whitelist estricta (nunca permitir scripts como .html, .svg, .js)
  let extension = MIME_A_EXTENSION[archivo.type];
  if (!extension) {
    const rawExt = (archivo.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (EXTENSIONES_PERMITIDAS.has(rawExt)) {
      extension = rawExt;
    } else {
      extension = "bin";
    }
  }

  const nombreUnico = `${randomUUID()}.${extension}`;

  const directorio = path.join(process.cwd(), "public", "uploads", carpetaSanitizada);
  await mkdir(directorio, { recursive: true });

  const rutaCompleta = path.join(directorio, nombreUnico);
  await writeFile(rutaCompleta, buffer);

  return `/uploads/${carpetaSanitizada}/${nombreUnico}`;
}
