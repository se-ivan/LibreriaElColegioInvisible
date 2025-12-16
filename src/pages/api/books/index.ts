import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma"; 

export const GET: APIRoute = async () => {
  try {
    const books = await prisma.book.findMany({
      include: { author: true },
    });

    return new Response(JSON.stringify({
      books,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error en /api/books:", error);
    return new Response(JSON.stringify({ error: "Error interno al obtener libros" }), { status: 500 });
  }
};