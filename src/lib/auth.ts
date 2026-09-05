import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

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
          nombre: usuario.socio
            ? `${usuario.socio.nombre} ${usuario.socio.apellido}`
            : usuario.email,
          socioId: usuario.socio?.id ?? null,
          idCooperativa: usuario.socio?.idCooperativa ?? null,
          fotoUrl: usuario.socio?.fotoUrl ?? null,
        };
      },
    }),
  ],
  callbacks: {
    // Persistimos rol y datos de socio en el JWT para no consultar la DB en cada request
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.rol = (user as any).rol;
        token.nombre = (user as any).nombre;
        token.socioId = (user as any).socioId;
        token.idCooperativa = (user as any).idCooperativa;
        token.fotoUrl = (user as any).fotoUrl;
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
