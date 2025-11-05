// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { getSession } from "auth-astro/server";

// Rutas que requieren que el usuario esté autenticado
const protectedRoutes = ["/dashboard", "/profile", "/admin"];

// Rutas que solo son para usuarios NO autenticados (ej. login)
const authRoutes = ["/login"];

export const onRequest = defineMiddleware(async (context, next) => {
  // Obtener la sesión usando getSession
  const session = await getSession(context.request);
  const { pathname } = context.url;

  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si es una ruta protegida y no hay sesión, redirigir al login
  if (isProtectedRoute && !session) {
    console.log("⚠️ Usuario no autenticado intentando acceder a:", pathname);
    return context.redirect("/login");
  }

  // Verificar si es una ruta de autenticación (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Si ya está autenticado e intenta ir al login, redirigir a home
  if (isAuthRoute && session) {
    console.log("✅ Usuario autenticado redirigido desde login a home");
    return context.redirect("/");
  }

  // Agregar sesión a locals para que esté disponible en las páginas
  context.locals.session = Promise.resolve(session);

  return next();
});