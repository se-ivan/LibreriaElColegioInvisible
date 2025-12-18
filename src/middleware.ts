import { defineMiddleware } from "astro:middleware"
import { getSession } from "auth-astro/server"
import logger, { generateCorrelationId } from "./lib/logger"

const protectedRoutes = ["/dashboard", "/profile", "/admin"]
const authRoutes = ["/login"]

export const onRequest = defineMiddleware(async (context, next) => {
  const correlationId = generateCorrelationId()
  const startTime = Date.now()
  const { pathname } = context.url

  if (!pathname.startsWith("/_") && !pathname.includes(".")) {
    logger.http("Page request", {
      correlationId,
      context: {
        method: context.request.method,
        path: pathname,
      },
    })
  }

  const session = await getSession(context.request)

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    logger.warn("Unauthorized access attempt", {
      correlationId,
      context: {
        path: pathname,
        action: "REDIRECT_TO_LOGIN",
      },
    })
    return context.redirect("/login")
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isAuthRoute && session) {
    logger.info("Authenticated user redirected from auth page", {
      correlationId,
      context: {
        userId: session.user?.email,
        from: pathname,
        to: "/",
      },
    })
    return context.redirect("/")
  }

  context.locals.session = Promise.resolve(session)

  const response = await next()

  if (!pathname.startsWith("/_") && !pathname.includes(".")) {
    logger.debug("Page rendered", {
      correlationId,
      duration: Date.now() - startTime,
      context: { path: pathname, status: response.status },
    })
  }

  return response
})
