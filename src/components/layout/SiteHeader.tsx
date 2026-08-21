"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, FileText, Wrench, Settings, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";



const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/noticias", label: "Noticias" },
  { href: "/talleres", label: "Talleres" },
  { href: "/proyectos", label: "Proyectos" },
];

const menuSocio = [
  { href: "/portal/perfil", label: "Mi Perfil", icon: User },
  { href: "/portal/pagos", label: "Historial de Cuotas", icon: FileText },
  { href: "/portal/talleres", label: "Talleres", icon: Wrench },
  { href: "/portal/configuracion", label: "Configuración", icon: Settings },
];

export function SiteHeader() {
  const { data: session, status } = useSession();
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nombre = session?.user?.nombre ?? "";
  const iniciales = nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  const esSocio = session?.user?.rol === "SOCIO";

  return (
    <header className="border-b border-surface-border bg-white sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <Image
            src="/logo_nuevo_2.png"
            alt="Cooperativa Riojana"
            width={200}
            height={80}
            className="h-14 w-auto object-contain transition-all"
            priority
          />
        </Link>
        <nav className="hidden gap-6 text-sm text-gray-600 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">

 <div className="hidden lg:flex items-center gap-3 text-gray-500">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61593704152272"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-primary transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/cooperativariojana/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-primary transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/cooperativa-riojana-ltda-8284b842b/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-primary transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="hover:text-primary transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.56-1.33 2.55-.03 1.29.62 2.52 1.68 3.12 1.05.61 2.43.58 3.44-.07.82-.52 1.34-1.43 1.38-2.4.07-3.83.03-7.67.04-11.5-.01-.01-.01-.02-.02-.02z" />
              </svg>
            </a>
          </div>





        {status === "loading" ? (
          <div className="h-9 w-24" />
        ) : session ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setAbierto((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-muted"
            >
              <div className="text-right">
                <p className="font-medium leading-tight text-primary-dark">{nombre}</p>
                {esSocio && (
                  <p className="text-xs leading-tight text-gray-400">
                    Socio N° {session.user.idCooperativa}
                  </p>
                )}
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                {iniciales}
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {abierto && (
              <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-card border border-surface-border bg-white shadow-lg">
                <div className="border-b border-surface-border px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                    {esSocio ? "Portal del Socio" : "Panel de Administración"}
                  </p>
                </div>

                <div className="py-1">
                  {esSocio ? (
                    menuSocio.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAbierto(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-surface-muted hover:text-primary"
                      >
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    ))
                  ) : (
                    <Link
                      href="/admin"
                      onClick={() => setAbierto(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-surface-muted hover:text-primary"
                    >
                      <Settings size={16} />
                      Panel de Administración
                    </Link>
                  )}
                </div>

                <div className="border-t border-surface-border py-1">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-status-danger hover:bg-status-danger/5"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn-primary">
            Acceso Socio
          </Link>
        )}
      </div>
      </div>
    </header>
  );
}
