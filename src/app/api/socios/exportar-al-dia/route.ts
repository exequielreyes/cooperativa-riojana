import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ExcelJS from "exceljs";

function getEdad(fecha: Date | null | undefined): string | number {
  if (!fecha) return "—";
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }
  return isNaN(edad) ? "—" : edad;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") ?? "";
  const region = searchParams.get("region") ?? "";
  const edad = searchParams.get("edad") ?? "";

  const currentArea = request.cookies.get("coop_area")?.value || "SEPELIO";
  const hoy = new Date();

  let whereEdad: any = undefined;
  if (edad) {
    if (edad === "0-18") {
      whereEdad = { fechaNacimiento: { gte: new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate()) } };
    } else if (edad === "19-25") {
      whereEdad = { fechaNacimiento: { gt: new Date(hoy.getFullYear() - 26, hoy.getMonth(), hoy.getDate()), lte: new Date(hoy.getFullYear() - 19, hoy.getMonth(), hoy.getDate()) } };
    } else if (edad === "26-35") {
      whereEdad = { fechaNacimiento: { gt: new Date(hoy.getFullYear() - 36, hoy.getMonth(), hoy.getDate()), lte: new Date(hoy.getFullYear() - 26, hoy.getMonth(), hoy.getDate()) } };
    } else if (edad === "36-50") {
      whereEdad = { fechaNacimiento: { gt: new Date(hoy.getFullYear() - 51, hoy.getMonth(), hoy.getDate()), lte: new Date(hoy.getFullYear() - 36, hoy.getMonth(), hoy.getDate()) } };
    } else if (edad === "50+") {
      whereEdad = { fechaNacimiento: { lte: new Date(hoy.getFullYear() - 51, hoy.getMonth(), hoy.getDate()) } };
    }
  }

  // Criterio exacto de "Al Día": Socio activo sin cuotas impagas vencidas
  const where = {
    area: currentArea as any,
    estado: "ACTIVO" as const,
    cuotas: {
      none: {
        estado: { not: "PAGADO" as const },
        fechaVencimiento: { lte: hoy },
      },
    },
    ...(q && {
      OR: [
        { nombre: { contains: q } },
        { apellido: { contains: q } },
        { email: { contains: q } },
        { idCooperativa: { contains: q } },
      ],
    }),
    ...(region && { region }),
    ...(whereEdad && whereEdad),
  };

  const socios = await prisma.socio.findMany({
    where,
    include: {
      grupoFamiliar: true,
      cuotas: {
        where: { estado: "PAGADO" },
        orderBy: { fechaVencimiento: "desc" },
        take: 1,
        include: { pagos: { orderBy: { fechaPago: "desc" }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Cooperativa Riojana Ltda.";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Socios al Día", {
    views: [{ showGridLines: true }],
  });

  // Configuración de anchos de columna
  sheet.columns = [
    { key: "num", width: 8 },
    { key: "tipo", width: 14 },
    { key: "nroSocio", width: 14 },
    { key: "dni", width: 16 },
    { key: "nombre", width: 40 },
    { key: "ultimosPagos", width: 18 },
    { key: "edad", width: 10 },
  ];

  // FILA 1: Banner Institucional
  sheet.mergeCells("A1:G1");
  const cellA1 = sheet.getCell("A1");
  cellA1.value = "COOPERATIVA RIOJANA LTDA.";
  cellA1.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  cellA1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F4C4C" } };
  cellA1.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(1).height = 32;

  // FILA 2: Subtítulo
  sheet.mergeCells("A2:G2");
  const cellA2 = sheet.getCell("A2");
  cellA2.value = "PADRÓN OFICIAL - SOCIOS Y FAMILIARES CON CUOTAS AL DÍA";
  cellA2.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFE2E8F0" } };
  cellA2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF115E59" } };
  cellA2.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(2).height = 24;

  // FILA 3: Metadatos y Fecha
  sheet.mergeCells("A3:G3");
  const cellA3 = sheet.getCell("A3");
  const fechaGeneracion = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const horaGeneracion = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  cellA3.value = `Área: ${currentArea} | Fecha de emisión: ${fechaGeneracion} ${horaGeneracion} | Total de titulares al día: ${socios.length}`;
  cellA3.font = { name: "Calibri", size: 9.5, italic: true, color: { argb: "FF475569" } };
  cellA3.alignment = { vertical: "middle", horizontal: "center" };
  cellA3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
  sheet.getRow(3).height = 20;

  // FILA 4: Espacio separador
  sheet.getRow(4).height = 8;

  // FILA 5: Cabecera de la Tabla
  const headerRow = sheet.getRow(5);
  headerRow.values = [
    "N°",
    "Tipo",
    "N° Socio",
    "DNI",
    "Apellido y Nombre",
    "Últimos Pagos",
    "Edad",
  ];
  headerRow.height = 26;

  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F4C4C" } };
    cell.alignment = {
      vertical: "middle",
      horizontal: colNumber === 5 ? "left" : "center",
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF093636" } },
      bottom: { style: "medium", color: { argb: "FF093636" } },
      left: { style: "thin", color: { argb: "FF115E59" } },
      right: { style: "thin", color: { argb: "FF115E59" } },
    };
  });

  // FILAS DE DATOS
  let rowIndex = 6;
  let contadorTitulares = 0;
  let contadorFamiliares = 0;

  const thinBorder = {
    top: { style: "thin" as const, color: { argb: "FFE2E8F0" } },
    bottom: { style: "thin" as const, color: { argb: "FFE2E8F0" } },
    left: { style: "thin" as const, color: { argb: "FFE2E8F0" } },
    right: { style: "thin" as const, color: { argb: "FFE2E8F0" } },
  };

  for (const socio of socios) {
    contadorTitulares++;
    const rowTitular = sheet.getRow(rowIndex);

    const nroSocioLimpio = socio.idCooperativa?.split("-").pop() || socio.idCooperativa;
    const ultimoPago = socio.cuotas?.[0]?.pagos?.[0]?.fechaPago
      ? new Date(socio.cuotas[0].pagos[0].fechaPago).toLocaleDateString("es-AR", { timeZone: "UTC" })
      : "—";
    const edadTitular = getEdad(socio.fechaNacimiento as any);

    rowTitular.values = [
      contadorTitulares,
      "Activo",
      nroSocioLimpio,
      socio.dni,
      `${socio.apellido} ${socio.nombre}`.toUpperCase(),
      ultimoPago,
      edadTitular,
    ];
    rowTitular.height = 22;

    rowTitular.eachCell((cell, colNumber) => {
      cell.border = thinBorder;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: contadorTitulares % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF" },
      };

      if (colNumber === 1) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
      } else if (colNumber === 2) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF047857" } };
      } else if (colNumber === 3) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0F172A" } };
      } else if (colNumber === 4) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
      } else if (colNumber === 5) {
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0F172A" } };
      } else if (colNumber === 6) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
      } else if (colNumber === 7) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
      }
    });

    rowIndex++;

    // Sub-filas de Grupo Familiar (excluyendo a Titular Anterior según regla de negocio)
    const familiares = socio.grupoFamiliar?.filter(
      (fam) => fam.activo !== false && !fam.parentesco.includes("Titular Anterior")
    );

    if (familiares && familiares.length > 0) {
      for (const fam of familiares) {
        contadorFamiliares++;
        const rowFam = sheet.getRow(rowIndex);
        const edadFam = getEdad(fam.fechaNacimiento as any);

        rowFam.values = [
          "",
          "Familiar",
          nroSocioLimpio,
          fam.dni ?? "—",
          `   └ ${fam.apellido} ${fam.nombre} (${fam.parentesco})`.toUpperCase(),
          "—",
          edadFam,
        ];
        rowFam.height = 20;

        rowFam.eachCell((cell, colNumber) => {
          cell.border = thinBorder;
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF1F5F9" },
          };

          if (colNumber === 2) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.font = { name: "Calibri", size: 9.5, italic: true, color: { argb: "FF64748B" } };
          } else if (colNumber === 3) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.font = { name: "Calibri", size: 9.5, color: { argb: "FF94A3B8" } };
          } else if (colNumber === 4) {
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.font = { name: "Calibri", size: 9.5, color: { argb: "FF64748B" } };
          } else if (colNumber === 5) {
            cell.alignment = { vertical: "middle", horizontal: "left" };
            cell.font = { name: "Calibri", size: 9.5, color: { argb: "FF475569" } };
          } else {
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.font = { name: "Calibri", size: 9.5, color: { argb: "FF94A3B8" } };
          }
        });

        rowIndex++;
      }
    }
  }

  // Fila resumen final
  rowIndex++;
  sheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
  const totalLabelCell = sheet.getCell(`A${rowIndex}`);
  totalLabelCell.value = "TOTALES DEL PADRÓN AL DÍA:";
  totalLabelCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0F4C4C" } };
  totalLabelCell.alignment = { vertical: "middle", horizontal: "right" };

  const totalTitularesCell = sheet.getCell(`E${rowIndex}`);
  totalTitularesCell.value = `${contadorTitulares} socios titulares · ${contadorFamiliares} adherentes`;
  totalTitularesCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0F4C4C" } };
  totalTitularesCell.alignment = { vertical: "middle", horizontal: "left" };

  sheet.mergeCells(`F${rowIndex}:G${rowIndex}`);
  const totalGeneralCell = sheet.getCell(`F${rowIndex}`);
  totalGeneralCell.value = `Total general: ${contadorTitulares + contadorFamiliares}`;
  totalGeneralCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF047857" } };
  totalGeneralCell.alignment = { vertical: "middle", horizontal: "center" };

  const totalRow = sheet.getRow(rowIndex);
  totalRow.height = 24;
  totalRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6FFFA" } };
    cell.border = {
      top: { style: "medium", color: { argb: "FF0F4C4C" } },
      bottom: { style: "medium", color: { argb: "FF0F4C4C" } },
    };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fechaStr = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="socios-al-dia-${fechaStr}.xlsx"`,
    },
  });
}
