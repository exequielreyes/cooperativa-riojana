import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: string;
      nombre: string;
      socioId: string | null;
      idCooperativa: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    rol: string;
    nombre: string;
    socioId: string | null;
    idCooperativa: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol: string;
    nombre: string;
    socioId: string | null;
    idCooperativa: string | null;
  }
}
