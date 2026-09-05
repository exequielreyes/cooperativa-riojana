"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function AdminThemeWrapper({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("admin-theme-dark");
    if (stored === "true") {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("admin-theme-dark", String(isDark));
    }
  }, [isDark, mounted]);

  const baseClass = "flex min-h-screen transition-colors duration-200";
  // Si no está montado aún, usamos por defecto el claro (o podríamos forzar hidratación)
  const themeClass = !mounted ? "bg-surface-muted" : (isDark ? "admin-theme" : "bg-surface-muted");

  return (
    <div className={`${baseClass} ${themeClass}`}>
      {children}
      
      {/* Botón flotante para alternar el tema */}
      {mounted && (
        <button
          onClick={() => setIsDark(!isDark)}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95"
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      )}
    </div>
  );
}
