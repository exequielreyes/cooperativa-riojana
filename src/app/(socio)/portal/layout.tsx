import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import AppChatBot from "@/components/ChatBot";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Si el admin dio de baja esta cuenta después de emitida la sesión, la
  // cortamos igual acá (el JWT en sí sigue siendo válido hasta que expire).
  const usuario = await prisma.usuario.findUnique({ where: { id: session.user.id } });
  if (!usuario?.activo) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <SiteHeader />
      <main className="flex-1">{children}
       <AppChatBot />
      </main>
      <PublicFooter />
    </div>
  );
}
