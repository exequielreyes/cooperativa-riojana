/**
 * Convierte un link de YouTube o Vimeo en su URL embebible para <iframe>.
 * Si no reconoce el formato, devuelve null (se muestra como link normal).
 */
export function obtenerUrlEmbebible(url: string): string | null {
  try {
    const u = new URL(url);

    // youtube.com/watch?v=XXXX  |  youtu.be/XXXX  |  youtube.com/embed/XXXX
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let videoId = "";
      if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.slice(1);
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.replace("/embed/", "");
      } else {
        videoId = u.searchParams.get("v") ?? "";
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // vimeo.com/XXXXXXXX
    if (u.hostname.includes("vimeo.com")) {
      const videoId = u.pathname.split("/").filter(Boolean).pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  } catch {
    return null;
  }
}
