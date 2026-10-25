import { TalonarioData } from "@/components/socio/TalonarioItem";

/**
 * Genera una imagen PNG en alta resolución de un cupón individual del talonario
 * y dispara su descarga automática en el navegador.
 */
export async function descargarTalonarioComoImagen(talonario: TalonarioData) {
  if (typeof window === "undefined") return;

  const width = 900;
  const height = 520;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Fondo blanco puro
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Borde troquelado / punteado característico del cupón físico
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#334155";
  ctx.strokeRect(18, 18, width - 36, height - 36);
  ctx.restore();

  // Intentar cargar el isotipo de la cooperativa
  const logo = await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/logo_nuevo_2.png";
  });

  // Cabecera: Logo y Matrícula (Izquierda)
  if (logo) {
    ctx.drawImage(logo, 45, 32, 100, 60);
  }
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 13px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("COOPERATIVA RIOJANA Ltda.", 95, 112);
  ctx.font = "bold 11px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText("MATRICULA Nº 7346", 95, 128);

  // Cabecera: Centro - SERVICIO DE SEPELIO y Teléfonos
  ctx.textAlign = "center";
  ctx.fillStyle = "#020617";
  ctx.font = "900 24px 'Segoe UI', Arial, sans-serif";
  const concepto = talonario.concepto || ((talonario.socio as any)?.area === "CONSUMO" ? "SERVICIO DE CONSUMO" : "SERVICIO DE SEPELIO");
  ctx.fillText(concepto, 450, 60);

  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 15px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Tel: (0380) 4422089", 450, 92);
  ctx.fillText("4423238", 450, 116);

  // Cabecera: Derecha - Números gigantes apilados de Mes y Año
  const mesStr = String(talonario.mes).padStart(2, "0");
  const anioStr = String(talonario.anio).slice(-2);

  ctx.textAlign = "center";
  ctx.fillStyle = "#020617";
  ctx.font = "900 68px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(mesStr, 800, 80);
  ctx.fillText(anioStr, 800, 142);

  // Línea divisoria sólida bajo cabecera
  ctx.save();
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(35, 155);
  ctx.lineTo(width - 35, 155);
  ctx.stroke();
  ctx.restore();

  // Cuerpo: Nombre y Apellido
  ctx.textAlign = "left";
  ctx.font = "bold 17px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText("Nombre y Apellido:", 50, 225);

  const nombreCompleto = `${talonario.socio.nombre} ${talonario.socio.apellido}`.toUpperCase();
  ctx.font = "900 20px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(nombreCompleto, 225, 225);

  // Subrayado punteado para el nombre
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(220, 235);
  ctx.lineTo(width - 50, 235);
  ctx.stroke();
  ctx.restore();

  // Línea divisoria punteada inferior
  ctx.save();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(35, 330);
  ctx.lineTo(width - 35, 330);
  ctx.stroke();
  ctx.restore();

  // Pie: Nº Socio | Administración | Celular
  ctx.font = "bold 17px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("Nº Socio:", 50, 385);
  ctx.font = "900 18px 'Segoe UI', Arial, sans-serif";
  ctx.fillText(talonario.socio.idCooperativa, 135, 385);

  ctx.font = "15px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#334155";
  ctx.fillText("Administración: Dorrego 63", 50, 440);
  ctx.fillText("Cel: 3804 941794", 500, 440);

  // Disparar la descarga del archivo PNG
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `talonario-${mesStr}-${anioStr}-${talonario.socio.idCooperativa}.png`;
  link.href = dataUrl;
  link.click();
}
