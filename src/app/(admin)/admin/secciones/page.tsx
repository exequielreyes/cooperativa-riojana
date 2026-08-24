import { FileText, HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";


const secciones = [
  {
    href: "/admin/secciones/acerca-de-nosotros",
    icon: FileText,
    titulo: "Acerca de Nosotros",
    descripcion: "Editá el texto que se muestra en la página institucional.",
  },
  {
    href: "/admin/secciones/contacto",
    icon: HelpCircle,
    titulo: "Preguntas Frecuentes",
    descripcion: "Administrá las preguntas frecuentes de la página de Contacto.",
  },
  {
    href: "/admin/secciones/chatbot",
    icon: MessageCircle,
    titulo: "Contenido del Chatbot",
    descripcion: "Agregá respuestas por palabras clave para el asistente del sitio.",
  },
];



export default function SeccionesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="mb-1 text-2xl font-semibold text-primary-dark">Edición de Secciones</h1>
      <p className="mb-6 text-sm text-gray-500">Elegí qué contenido del sitio querés editar.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {secciones.map((s) => (
          <Link key={s.href} href={s.href} className="card block hover:border-primary/40">
            <s.icon className="mb-3 text-primary" size={22} />
            <p className="font-medium text-primary-dark">{s.titulo}</p>
            <p className="mt-1 text-xs text-gray-500">{s.descripcion}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}   