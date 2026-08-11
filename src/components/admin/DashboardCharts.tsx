"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PuntoMes {
  mes: string;
  valor: number;
}

export function TendenciaCobranzaChart({ datos }: { datos: PuntoMes[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={datos}>
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(value)
          }
        />
        <Line type="monotone" dataKey="valor" stroke="#0F3D3A" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function NuevosSociosChart({ datos }: { datos: PuntoMes[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={datos}>
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip />
        <Bar dataKey="valor" fill="#C99A3C" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
