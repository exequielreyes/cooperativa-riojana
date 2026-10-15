import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ExcelJS from "exceljs";

const estadoLabel: Record<string, string> = {
  APROBADO: "Completado",
  PENDIENTE_REVISION: "Pendiente",
  RECHAZADO: "Rechazado",
};

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") ?? "";
  const estado = searchParams.get("estado") ?? "";
  const metodo = searchParams.get("metodo") ?? "";

  // Mismo criterio de filtrado que usa la pantalla de Gestión de Pagos,
  // pero sin el take:50 -> exporta TODO lo que matchee, no sólo lo visible.
  const where = {
    ...(estado && { estadoValidacion: estado as "PENDIENTE_REVISION" | "APROBADO" | "RECHAZADO" }),
    ...(metodo && { metodo: metodo as "TRANSFERENCIA" | "EFECTIVO" | "MERCADOPAGO" }),
    ...(q && {
      socio: {
        OR: [
          { nombre: { contains: q } },
          { apellido: { contains: q } },
          { idCooperativa: { contains: q } },
          { email: { contains: q } },
        ],
      },
    }),
  };

  const pagos = await prisma.pago.findMany({
    where,
    include: { socio: true, validadoPor: true, cuota: true },
    orderBy: { fechaPago: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Cooperativa Riojana";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Pagos");

  sheet.columns = [
    { header: "Fecha de Pago", key: "fecha", width: 16 },
    { header: "Socio", key: "socio", width: 28 },
    { header: "ID Cooperativa", key: "idCooperativa", width: 16 },
    { header: "Email", key: "email", width: 28 },
    { header: "Cuotas Asociadas", key: "cuotas", width: 32 },
    { header: "Método", key: "metodo", width: 16 },
    { header: "Estado", key: "estado", width: 14 },
    { header: "Monto", key: "monto", width: 14 },
    { header: "Validado por", key: "validadoPor", width: 24 },
    { header: "Fecha Validación", key: "fechaValidacion", width: 16 },
    { header: "Motivo de Rechazo", key: "notaRechazo", width: 32 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8F0EC" },
  };

  type PagoConRelaciones = (typeof pagos)[0];
  interface PagoAgrupadoExport {
    pago: PagoConRelaciones;
    montoTotal: number;
    cuotasDetalle: string;
  }

  const gruposMap = new Map<string, PagoAgrupadoExport>();

  for (const pago of pagos) {
    let groupKey = `pago_${pago.id}`;
    if (pago.grupoPagoId) {
      groupKey = `grp_${pago.grupoPagoId}`;
    } else if (pago.comprobanteUrl) {
      groupKey = `comp_${pago.socioId}_${pago.comprobanteUrl}`;
    }

    const cuotaStr = pago.cuota ? `${pago.cuota.periodo}` : "";
    const existing = gruposMap.get(groupKey);
    if (existing) {
      existing.montoTotal += Number(pago.monto);
      if (cuotaStr) {
        existing.cuotasDetalle += `, ${cuotaStr}`;
      }
    } else {
      gruposMap.set(groupKey, {
        pago,
        montoTotal: Number(pago.monto),
        cuotasDetalle: cuotaStr,
      });
    }
  }

  let totalAprobado = 0;

  for (const item of gruposMap.values()) {
    const { pago, montoTotal, cuotasDetalle } = item;
    sheet.addRow({
      fecha: pago.fechaPago,
      socio: `${pago.socio.nombre} ${pago.socio.apellido}`,
      idCooperativa: pago.socio.idCooperativa,
      email: pago.socio.email,
      cuotas: cuotasDetalle || "—",
      metodo: pago.metodo,
      estado: estadoLabel[pago.estadoValidacion],
      monto: montoTotal,
      validadoPor: pago.validadoPor?.email ?? "",
      fechaValidacion: pago.fechaValidacion ?? null,
      notaRechazo: pago.notaRechazo ?? "",
    });

    if (pago.estadoValidacion === "APROBADO") {
      totalAprobado += montoTotal;
    }
  }

  sheet.getColumn("fecha").numFmt = "dd/mm/yyyy";
  sheet.getColumn("fechaValidacion").numFmt = "dd/mm/yyyy";
  sheet.getColumn("monto").numFmt = '"$" #,##0';

  sheet.addRow({});
  const totalRow = sheet.addRow({ socio: "Total recaudado (aprobado)", monto: totalAprobado });
  totalRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const fecha = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reporte-pagos-${fecha}.xlsx"`,
    },
  });
}