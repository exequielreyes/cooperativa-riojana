import { prisma } from "@/lib/db";
import { GestorFaqs } from "@/components/admin/GestorFaqs";

export default async function ContactoAdminPage() {
  const faqs = await prisma.preguntaFrecuente.findMany({ orderBy: { orden: "asc" } });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-primary-dark">Preguntas Frecuentes</h1>
      <p className="mb-6 text-sm text-gray-500">
        Se muestran en ese orden en la página pública de Contacto.
      </p>
      <GestorFaqs faqsIniciales={faqs} />
    </div>
  );
}
