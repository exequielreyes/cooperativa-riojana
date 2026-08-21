type Campo = HTMLTextAreaElement | HTMLInputElement;

function reemplazarSeleccion(campo: Campo, textoNuevo: string, cursorRelativo: number) {
  const inicio = campo.selectionStart ?? 0;
  const fin = campo.selectionEnd ?? 0;
  const valor = campo.value;
  campo.value = `${valor.slice(0, inicio)}${textoNuevo}${valor.slice(fin)}`;
  campo.focus();
  const nuevaPosicion = inicio + cursorRelativo;
  campo.setSelectionRange(nuevaPosicion, nuevaPosicion);
}

/** Envuelve la selección en **negrita**. */
export function aplicarNegrita(campo: Campo) {
  const inicio = campo.selectionStart ?? 0;
  const fin = campo.selectionEnd ?? 0;
  const seleccion = campo.value.slice(inicio, fin) || "texto en negrita";
  reemplazarSeleccion(campo, `**${seleccion}**`, seleccion.length + 4);
}

/** Convierte la línea actual (o el texto seleccionado) en un subtítulo. */
export function aplicarSubtitulo(campo: Campo) {
  const inicio = campo.selectionStart ?? 0;
  const fin = campo.selectionEnd ?? 0;
  const seleccion = campo.value.slice(inicio, fin) || "Subtítulo";
  const textoNuevo = `\n## ${seleccion}\n`;
  reemplazarSeleccion(campo, textoNuevo, textoNuevo.length);
}

/** Pide una URL (y texto a mostrar) e inserta un link [texto](url). */
export function aplicarLink(campo: Campo) {
  const url = window.prompt("Pegá el link (URL completa, incluyendo https://)");
  if (!url) return;

  const inicio = campo.selectionStart ?? 0;
  const fin = campo.selectionEnd ?? 0;
  const seleccionActual = campo.value.slice(inicio, fin);
  const textoVisible = seleccionActual || window.prompt("¿Qué texto querés que se vea para este link?", url) || url;

  reemplazarSeleccion(campo, `[${textoVisible}](${url})`, `[${textoVisible}](${url})`.length);
}

function extraerIdYoutube(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  return match ? match[1] : null;
}

function extraerIdTiktok(url: string): string | null {
  const match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  return match ? match[1] : null;
}

/** Pide una plataforma (YouTube/TikTok) y un link, e inserta el token de video. */
export function aplicarVideo(campo: Campo) {
  const plataformaInput = window.prompt('¿De dónde es el video? Escribí "youtube" o "tiktok"', "youtube");
  if (!plataformaInput) return;
  const esTiktok = plataformaInput.trim().toLowerCase().startsWith("tik");

  const url = window.prompt(`Pegá el link completo del video de ${esTiktok ? "TikTok (formato tiktok.com/@usuario/video/...)" : "YouTube"}`);
  if (!url) return;

  const id = esTiktok ? extraerIdTiktok(url) : extraerIdYoutube(url);
  if (!id) {
    window.alert("No pudimos reconocer ese link. Verificá el formato e intentá de nuevo.");
    return;
  }

  const token = `\n{{video:${esTiktok ? "tiktok" : "youtube"}:${id}}}\n`;
  reemplazarSeleccion(campo, token, token.length);
}
