import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const rol = req.nextauth.token?.rol;
    const tieneSocio = !!req.nextauth.token?.socioId;

    // /admin/* sólo para SUPER_ADMIN y EDITOR_CONTENIDOS
    // if (pathname.startsWith("/admin") && rol === "SOCIO") {
    //   return NextResponse.redirect(new URL("/portal", req.url));
    // }

if (pathname.startsWith("/admin") && rol !== "SUPER_ADMIN" && rol !== "EDITOR_CONTENIDOS") {
      return NextResponse.redirect(new URL(rol === "PROFESOR" ? "/profesor" : "/portal", req.url));
    }

     // /profesor/* sólo para el rol PROFESOR
    if (pathname.startsWith("/profesor") && rol !== "PROFESOR") {
      return NextResponse.redirect(new URL(tieneSocio ? "/portal" : "/admin", req.url));
    }


    // /portal/* pensado para SOCIO; si un admin entra, lo dejamos pasar
    // (puede querer ver la vista de socio), pero si no hay socio asociado
    // en su cuenta lo mandamos al panel admin.
  //   if (
  //     pathname.startsWith("/portal") &&
  //     rol !== "SOCIO" &&
  //     !req.nextauth.token?.socioId
  //   ) {
  //     return NextResponse.redirect(new URL("/admin", req.url));
  //   }

  //   return NextResponse.next();
  // },

if (pathname.startsWith("/portal") && rol !== "SOCIO" && !tieneSocio) {
      return NextResponse.redirect(new URL(rol === "PROFESOR" ? "/profesor" : "/admin", req.url));
    }

    return NextResponse.next();
  },


  {
    callbacks: {
      // Sólo exige que exista sesión; la lógica de rol vive arriba
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*" , "/profesor/:path*"],
};
