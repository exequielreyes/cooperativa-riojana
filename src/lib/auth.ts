import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { prisma } from "@/lib/db";

// Huella de la contraseña guardada: si la contraseña cambia, las sesiones viejas dejan de valer
function huellaPassword(passwordHash: string) {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

export const ROLES = {
  SOCIO: "SOCIO",
  SUPER_ADMIN: "SUPER_ADMIN",
  EDITOR_CONTENIDOS: "EDITOR_CONTENIDOS",
  PROFESOR: "PROFESOR",
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo o usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: { socio: true },
        });

        if (!usuario || !usuario.activo) return null;

        const passwordValida = await bcrypt.compare(
          credentials.password,
          usuario.passwordHash
        );
        if (!passwordValida) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol,
          nombre: usuario.nombre
            ? usuario.nombre
            : usuario.socio
            ? `${usuario.socio.nombre} ${usuario.socio.apellido}`
            : usuario.email,
          socioId: usuario.socio?.id ?? null,
          idCooperativa: usuario.socio?.idCooperativa ?? null,
          fotoUrl: usuario.socio?.fotoUrl ?? null,
          huellaPassword: huellaPassword(usuario.passwordHash),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.rol = (user as any).rol;
        token.nombre = (user as any).nombre;
        token.socioId = (user as any).socioId;
        token.idCooperativa = (user as any).idCooperativa;
        token.fotoUrl = (user as any).fotoUrl;
        token.huellaPassword = (user as any).huellaPassword;
      } else if (token.sub) {
        // Revalidamos contra la DB: una baja, un borrado o un cambio de contraseña cierran la sesión.
        // Lanzar un error (y no devolver {}) es lo que hace que next-auth borre la cookie.
        const usuario = await prisma.usuario.findUnique({
          where: { id: token.sub },
          select: { activo: true, rol: true, passwordHash: true, socio: { select: { id: true } } },
        });
        if (
          !usuario ||
          !usuario.activo ||
          huellaPassword(usuario.passwordHash) !== token.huellaPassword
        ) {
          throw new Error("Sesión revocada");
        }
        token.rol = usuario.rol;
        token.socioId = usuario.socio?.id ?? null;
      }
      if (trigger === "update" && session?.fotoUrl !== undefined) {
        token.fotoUrl = session.fotoUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).rol = token.rol;
        (session.user as any).nombre = token.nombre;
        (session.user as any).socioId = token.socioId;
        (session.user as any).idCooperativa = token.idCooperativa;
        (session.user as any).fotoUrl = token.fotoUrl;
      }
      return session;
    },
  },
};
