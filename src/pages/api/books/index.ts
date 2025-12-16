import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma"; // Ajusta la ruta según tu estructura

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  try {
    const whereClause = query
      ? {
          OR: [
            { title: { contains: query } },
          ],
        }
      : {};

    const books = await prisma.book.findMany({
      where: whereClause,
      include: { author: true },
      take: 5, 
    });

    return new Response(JSON.stringify(books), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener libros:", error);
    return new Response(
      JSON.stringify({ error: "Error al leer la base de datos" }),
      { status: 500 }
    );
  }
};