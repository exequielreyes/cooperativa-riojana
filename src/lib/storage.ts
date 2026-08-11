import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Guarda un archivo en /public/uploads/<carpeta>/ y devuelve la URL pública.
 *
 * Esto es un adaptador simple para desarrollo local. Para producción,
 * reemplazar el cuerpo de esta función por un upload a S3/Cloudinary/etc.
 * y devolver la URL que ese proveedor genere — el resto de la app
 * (Pago.comprobanteUrl, Noticia.imagenUrl, Taller.imagenUrl) no cambia,
 * porque sólo espera un string con la URL final.
 */
export async function guardarArchivo(archivo: File, carpeta: string): Promise<string> {
  const bytes = await archivo.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extension = archivo.name.split(".").pop() ?? "bin";
  const nombreUnico = `${randomUUID()}.${extension}`;

  const directorio = path.join(process.cwd(), "public", "uploads", carpeta);
  await mkdir(directorio, { recursive: true });

  const rutaCompleta = path.join(directorio, nombreUnico);
  await writeFile(rutaCompleta, buffer);

  return `/uploads/${carpeta}/${nombreUnico}`;
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const TIPOS_PERMITIDOS_COMPROBANTE = ["image/jpeg", "image/png", "application/pdf"];
export const TIPOS_PERMITIDOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
