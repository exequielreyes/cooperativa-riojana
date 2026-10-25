import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { BotonCerrarSesion } from "@/components/auth/BotonCerrarSesion";
import { Settings, Wallet, Users } from "lucide-react";

export default async function CobradorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.rol !== "COBRADOR" && session.user.rol !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const nombreCobrador = session.user.nombre || session.user.email || "Cobrador";

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-surface-border bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet size={20} />
            </div>
            <div>
              <Link href="/cobrador" className="text-base font-bold text-primary-dark hover:underline">
                Panel del Cobrador
              </Link>
              <p className="text-xs text-gray-500 font-medium">
                {nombreCobrador} · <span className="text-primary font-semibold">Zonas 2, 3, 4, 5 y 6</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/cobrador"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary transition-colors"
            >
              <Users size={14} />
              Socios a Cobrar
            </Link>
            <Link
              href="/cobrador/configuracion"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary transition-colors"
            >
              <Settings size={14} />
              Configuración
            </Link>
            <BotonCerrarSesion />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
