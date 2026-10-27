export function formatCurrency(amount: number | string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Limpia la sintaxis de Markdown y elementos incrustados para mostrar texto plano limpio en tarjetas y resúmenes.
 */
export function limpiarMarkdown(texto: string = ""): string {
  if (!texto) return "";
  return texto
    .replace(/\{\{video:[^}]+\}\}/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .replace(/\*{3}(.*?)\*{3}/g, "$1")
    .replace(/\*{2}(.*?)\*{2}/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/_{3}(.*?)_{3}/g, "$1")
    .replace(/_{2}(.*?)_{2}/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

