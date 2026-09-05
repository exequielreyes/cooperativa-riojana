import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { BookOpen, Calendar, Users, GraduationCap, ChevronRight } from "lucide-react";

export default async function ProfesorHomePage() {
  const session = await getServerSession(authOptions);

  const talleres = await prisma.taller.findMany({
    where: { profesorId: session!.user.id },
    include: {
      _count: {
        select: { inscripciones: { where: { estado: "CONFIRMADO" } } },
      },
    },
    orderBy: { fecha: "asc" },
  });

  const nombreProfe = session?.user.nombre || "Profesor";

  return (
    <div className="space-y-8">
      
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-light p-8 text-white shadow-lg">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">¡Hola, {nombreProfe}! 👋</h1>
            <p className="text-white text-blue-100 max-w-md">
              Bienvenido a tu panel de control. Aquí puedes gestionar todos los talleres que tienes asignados, revisar tus alumnos e impartir tus conocimientos.
            </p>
          </div>
          <div className="hidden h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md md:flex">
            <GraduationCap size={40} className="text-white" />
          </div>
        </div>
        <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-accent opacity-20 blur-2xl"></div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary-dark">Tus Talleres Activos</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BookOpen size={16} />
          <span>{talleres.length} {talleres.length === 1 ? 'taller' : 'talleres'} en total</span>
        </div>
      </div>

      {talleres.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <div className="mb-4 rounded-full bg-gray-200 p-4">
            <BookOpen size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700">Sin talleres asignados</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            Todavía no tenés talleres asignados. Pedile al administrador que te asigne uno al crear o editar un taller.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {talleres.map((taller) => {
            const inscriptos = taller._count.inscripciones;
            const porcentaje = Math.round((inscriptos / taller.cuposTotales) * 100);
            const isLleno = inscriptos >= taller.cuposTotales;

            return (
              <Link
                key={taller.id}
                href={`/profesor/talleres/${taller.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-surface-border bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="p-6 pb-0">
                  <div className="mb-4 flex items-start justify-between">
                    <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-light">
                      {taller.categoria}
                    </span>
                    {isLleno ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase text-red-600">
                        Completo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold uppercase text-green-600">
                        Disponible
                      </span>
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-bold leading-tight text-primary-dark group-hover:text-primary">
                    {taller.titulo}
                  </h3>
                  <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(taller.fecha)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 pt-4 border-t border-gray-100">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <Users size={16} className="text-primary" />
                      {inscriptos} / {taller.cuposTotales} inscriptos
                    </div>
                    <span className="text-xs font-bold text-gray-400">{porcentaje}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isLleno ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(porcentaje, 100)}%` }}
                    />
                  </div>
                  
                  <div className="mt-4 flex items-center justify-end text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Gestionar alumnos <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}