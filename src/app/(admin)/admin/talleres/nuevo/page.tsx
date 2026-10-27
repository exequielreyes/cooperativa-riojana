import { NuevoTallerForm } from "@/components/admin/NuevoTallerForm";

export default function NuevoTallerPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-primary-dark">Subir Nuevo Taller</h1>
      <NuevoTallerForm />
    </div>
  );
}
