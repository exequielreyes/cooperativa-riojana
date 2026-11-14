// Acepta solo URLs http(s) y, si se pide, rutas internas ("/talleres").
// Bloquea javascript:, data: y similares, que en un href pueden ejecutar código.
export function esLinkSeguro(valor: string, permitirRutaInterna = false): boolean {
  if (permitirRutaInterna && /^\/(?![/\\])/.test(valor)) return true;
  try {
    const { protocol } = new URL(valor);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
