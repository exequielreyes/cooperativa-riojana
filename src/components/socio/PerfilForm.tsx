"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera } from "lucide-react";
import { useSession } from "next-auth/react";

interface Perfil {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fotoUrl: string | null;
  fechaNacimiento: string;
}

export function PerfilForm({ socio }: { socio: Perfil }) {
  const router = useRouter();
  const { update } = useSession();
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(socio.fotoUrl);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.get("nombre"),
          apellido: formData.get("apellido"),
          telefono: formData.get("telefono"),
          fechaNacimiento: formData.get("fechaNacimiento") ? new Date(formData.get("fechaNacimiento") as string).toISOString() : null,
        }),
      });

      setEnviando(false);
      setMensaje(res.ok ? "Cambios guardados." : "No se pudo actualizar el perfil.");
      if (res.ok) router.refresh();
    }

    async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
      const archivo = e.target.files?.[0];
      if (!archivo) return;

      setSubiendoFoto(true);
      const formData = new FormData();
      formData.append("foto", archivo);

      const res = await fetch("/api/perfil/foto", { method: "POST", body: formData });
      setSubiendoFoto(false);

      if (res.ok) {
        const data = await res.json();
        setFotoUrl(data.fotoUrl);
        await update({ fotoUrl: data.fotoUrl });
        router.refresh();
      }
    }

    return (
      <form className="card" onSubmit={handleSubmit}>
        <p className="mb-4 font-medium text-primary-dark">Perfil Personal</p>

        <div className="mb-5 flex items-center gap-4">
          <div className="relative h-20 w-20 flex-shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-primary/10">
              {fotoUrl ? (
                <Image src={fotoUrl} alt="Foto de perfil" width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-medium text-primary">
                  {socio.nombre[0]}
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary-light">
              <input type="file" accept="image/*" className="hidden" onChange={handleFoto} disabled={subiendoFoto} />
              <Camera size={13} />
            </label>
          </div>
          <p className="text-xs text-gray-400">{subiendoFoto ? "Subiendo..." : "Actualizar foto"}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input" name="nombre" defaultValue={socio.nombre} placeholder="Nombre" required />
          <input className="input" name="apellido" defaultValue={socio.apellido} placeholder="Apellido" required />
          <input className="input bg-surface-muted" value={socio.email} disabled />
          <input className="input" name="telefono" defaultValue={socio.telefono} placeholder="Teléfono" />
          <input className="input" type="date" name="fechaNacimiento" defaultValue={socio.fechaNacimiento} placeholder="Fecha de Nacimiento" />
        </div>
      {mensaje && <p className="mt-3 text-sm text-gray-500">{mensaje}</p>}
      <button type="submit" className="btn-primary mt-4" disabled={enviando}>
        {enviando ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}
