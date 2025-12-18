import type { APIRoute } from "astro"
import prisma from "../../../lib/prisma"
import logger, { logRequest, logResponse, logError, logDbOperation, generateCorrelationId } from "../../../lib/logger"

export const GET: APIRoute = async ({ request }) => {
  const correlationId = generateCorrelationId()
  const startTime = Date.now()

  logRequest(request, correlationId)

  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const query = url.searchParams.get("q") || ""

  const pageSize = 12
  const skip = (page - 1) * pageSize

  try {
    logger.debug("Fetching books", {
      correlationId,
      context: { page, query, pageSize },
    })

    const whereClause = query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { author: { name: { contains: query, mode: "insensitive" as const } } },
          ],
        }
      : {}

    const dbStart = Date.now()
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        include: { author: true },
        skip: skip,
        take: pageSize,
        orderBy: { title: "asc" },
      }),
      prisma.book.count({ where: whereClause }),
    ])

    logDbOperation("READ", "Book", Date.now() - dbStart, {
      correlationId,
      count: books.length,
      total,
      hasQuery: !!query,
    })

    const response = {
      books,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    }

    logResponse(200, correlationId, Date.now() - startTime, {
      booksReturned: books.length,
      totalFound: total,
    })

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Correlation-ID": correlationId, // Header para debugging
      },
    })
  } catch (error) {
    logError(error, "Failed to fetch books", {
      correlationId,
      page,
      query,
    })

    logResponse(500, correlationId, Date.now() - startTime)

    return new Response(
      JSON.stringify({
        error: "Error interno al obtener libros",
        correlationId, // Devolver ID para soporte
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "X-Correlation-ID": correlationId,
        },
      },
    )
  }
}
