import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const config = await prisma.configuracionCooperativa.findUnique({
    where: { id: "singleton" },
  });
  return NextResponse.json({ montoCapitalActual: Number(config?.montoCapitalActual ?? 50000) });
}