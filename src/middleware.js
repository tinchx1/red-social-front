import { NextResponse } from "next/server";
import { PROTECTED_PREFIXES, AUTH_PREFIXES } from "@/constants/middleware";

async function verifyTokenAndProfile(verifyUrl, profileUrl, cookieHeader) {
  try {
    // Verificar token
    const verifyResponse = await fetch(verifyUrl, {
      headers: { cookie: cookieHeader },
      credentials: "include",
      cache: "no-store",
    });
    if (!verifyResponse.ok) {
      return { isAuthenticated: false, isActive: false };
    }

    // Verificar perfil y estado activo
    const profileResponse = await fetch(profileUrl, {
      headers: { cookie: cookieHeader },
      credentials: "include",
      cache: "no-store",
    });
    if (!profileResponse.ok) {
      return { isAuthenticated: false, isActive: false };
    }

    const profile = await profileResponse.json();
    return {
      isAuthenticated: true,
      isActive: profile.isActive !== false,
      isAdmin: profile.roleKey === "super_admin",
    };
  } catch (error) {
    return { isAuthenticated: false, isActive: false };
  }
}

// Detectar si es una redirección de MercadoPago por sus query params típicos
function isMercadoPagoRedirect(searchParams) {
  const mpParams = [
    "collection_id",
    "collection_status",
    "payment_id",
    "status",
    "external_reference",
    "preference_id",
    "preapproval_id",
    "merchant_order_id",
  ];
  return mpParams.some((param) => searchParams.has(param));
}

export async function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PREFIXES.some((p) => pathname.startsWith(p));
  const isRootPath = pathname === "/";

  // Si es redirección de MercadoPago, dejar pasar (auth se verifica client-side)
  if (isMercadoPagoRedirect(searchParams)) {
    return NextResponse.next();
  }

  // Si no es una ruta protegida, auth o root, continuar
  if (!isProtected && !isAuthRoute && !isRootPath) {
    return NextResponse.next();
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const verifyUrl = `${apiBase}/auth/verify`;
  const profileUrl = `${apiBase}/profile/me`;
  const logoutUrl = `${apiBase}/auth/logout`;
  const cookieHeader = req.headers.get("cookie") || "";

  const { isAuthenticated, isActive, isAdmin } = await verifyTokenAndProfile(
    verifyUrl,
    profileUrl,
    cookieHeader
  );
  // Si el usuario no está activo, hacer logout
  if (isAuthenticated && !isActive) {
    try {
      await fetch(logoutUrl, {
        method: "POST",
        headers: { cookie: cookieHeader },
        credentials: "include",
      });
    } catch (error) {
      // Ignorar errores de logout
    }
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isAuthenticated && isAdmin && pathname.startsWith("/mensajes")) {
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_ADMIN_URL}/mensajes`, req.url)
    );
  }

  // Si está autenticado y está en root o rutas de auth, redirigir a /inicio
  if (isAuthenticated && (isRootPath || isAuthRoute)) {
    return NextResponse.redirect(new URL("/inicio", req.url));
  }

  // Si no está autenticado y está en ruta protegida, redirigir a login
  if (!isAuthenticated && isProtected && !isAuthRoute) {
    console.log("redirigiendo a login");
    const redirectUrl = new URL("/", req.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirecciones específicas
  if (pathname === "/red") {
    return NextResponse.redirect(new URL("/red/mis-contactos", req.url));
  }
  if (pathname === "/comunidades") {
    return NextResponse.redirect(
      new URL("/comunidades/mis-comunidades", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
