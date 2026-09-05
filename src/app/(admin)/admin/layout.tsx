import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { getContadoresPendientes } from "@/lib/contadores";
import { AdminThemeWrapper } from "@/components/admin/AdminThemeWrapper";



export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") redirect("/login");

  const usuario = await prisma.usuario.findUnique({ where: { id: session.user.id } });
  if (!usuario?.activo) redirect("/login");

  const contadores = await getContadoresPendientes();

  return (
    
<AdminThemeWrapper>
    {/* <div className="flex min-h-screen bg-surface-muted">  */}
      <AdminSidebar contadores={contadores} />
      <main className="flex-1 overflow-x-auto px-8 py-8">{children}</main>
     {/* </div>  */}
</AdminThemeWrapper>
    

  );
}