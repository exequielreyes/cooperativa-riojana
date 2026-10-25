import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const rol = req.nextauth.token?.rol;
    const tieneSocio = !!req.nextauth.token?.socioId;

    // /admin/* sólo para SUPER_ADMIN y EDITOR_CONTENIDOS
    if (pathname.startsWith("/admin") && rol !== "SUPER_ADMIN" && rol !== "EDITOR_CONTENIDOS") {
      const redirectUrl = rol === "PROFESOR" ? "/profesor" : rol === "COBRADOR" ? "/cobrador" : "/portal";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // /profesor/* sólo para el rol PROFESOR
    if (pathname.startsWith("/profesor") && rol !== "PROFESOR") {
      return NextResponse.redirect(new URL(tieneSocio ? "/portal" : rol === "COBRADOR" ? "/cobrador" : "/admin", req.url));
    }

    // /cobrador/* sólo para el rol COBRADOR (o SUPER_ADMIN)
    if (pathname.startsWith("/cobrador") && rol !== "COBRADOR" && rol !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(tieneSocio ? "/portal" : rol === "PROFESOR" ? "/profesor" : "/admin", req.url));
    }

    // /portal/* pensado para SOCIO; si no hay socio asociado en su cuenta lo mandamos a su panel
    if (pathname.startsWith("/portal") && rol !== "SOCIO" && !tieneSocio) {
      const redirectUrl = rol === "PROFESOR" ? "/profesor" : rol === "COBRADOR" ? "/cobrador" : "/admin";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    return NextResponse.next();
  },

  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/profesor/:path*", "/cobrador/:path*"],
};
