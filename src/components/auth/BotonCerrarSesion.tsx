"use client";

import { signOut } from "next-auth/react";

interface Props {
  className?: string;
  texto?: string;
}

export function BotonCerrarSesion({
  className = "text-xs text-gray-500 hover:text-status-danger cursor-pointer transition-colors",
  texto = "Cerrar sesión",
}: Props) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className}
    >
      {texto}
    </button>
  );
}