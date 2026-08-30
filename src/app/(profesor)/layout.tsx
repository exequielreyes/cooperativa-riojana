import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
// import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { BotonCerrarSesion } from "@/components/auth/BotonCerrarSesion";

export default async function ProfesorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== "PROFESOR") redirect("/login");

  return (
   <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-surface-border bg-white px-8 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-dark">Panel del Profesor</p>
            <p className="text-xs text-gray-500">{session.user.nombre}</p>
          </div>
          <BotonCerrarSesion />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-8 py-8">{children}</main>
    </div>
  );
}
