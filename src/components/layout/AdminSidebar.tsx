"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, CreditCard, Newspaper, GraduationCap, BookOpen, Settings, LogOut } from "lucide-react";


interface Contadores {
  socios: number;
  pagos: number;
  talleres: number;
}



export function AdminSidebar({contadores}: {contadores: Contadores}) {
  const pathname = usePathname();

const links = [
  { href: "/admin", label: "Métricas", icon: LayoutDashboard, badge: 0 },
  { href: "/admin/socios", label: "Socios", icon: Users, badge: contadores.socios },
  { href: "/admin/pagos", label: "Pagos", icon: CreditCard, badge: contadores.pagos },
  { href: "/admin/talleres", label: "Talleres", icon: GraduationCap, badge: contadores.talleres },
  { href: "/admin/contenidos", label: "Contenidos", icon: Newspaper, badge: 0 },
   { href: "/admin/secciones", label: "Secciones", icon: BookOpen, badge: 0 },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, badge: 0 },
];

  return (
    <aside className="flex  w-60 flex-col justify-between border-r border-surface-border bg-white px-4 py-6">
      <div>
        <p className="mb-6 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Administración
          <br />
          <span className="text-[11px] font-normal normal-case text-gray-400">
            Panel de Gestión
          </span>
        </p>
        <nav className="space-y-1">
          {links.map((link) => {
            const activo = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  activo ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-surface-muted hover:text-primary"
                }`}
              >
                <span className="flex items-center gap-2.5">
                <link.icon size={16} />
                {link.label}
                </span>
                {link.badge > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-status-danger px-1 text-[11px] font-medium text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-500 hover:text-status-danger"
      >
        <LogOut size={16} />
        Cerrar Sesión
      </button>
    </aside>
  );
}
