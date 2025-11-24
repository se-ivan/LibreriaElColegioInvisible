import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma"; 

export const GET: APIRoute = async () => {
  try {
    const books = await prisma.book.findMany({
      include: { author: true },
    });

    return new Response(JSON.stringify(books), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error al obtener libros:", error);
    return new Response(JSON.stringify({ error: "Error al leer la base de datos" }), { status: 500 });
  }
};