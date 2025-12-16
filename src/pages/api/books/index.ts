import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma"; // Asegúrate que la ruta sea correcta

export const GET: APIRoute = async ({ request }) => {
  // 1. Obtener parámetros de la URL
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const query = url.searchParams.get("q") || ""; // El texto del buscador
  
  // Configuración de paginación
  const pageSize = 12; // Cantidad de libros por carga
  const skip = (page - 1) * pageSize;

  try {
    // 2. Construir el filtro de búsqueda (Where Clause)
    // Si hay query, busca en título O en nombre del autor
    const whereClause = query
      ? {
          OR: [
            { 
              title: { contains: query, mode: "insensitive" } // 'insensitive' ignora mayúsculas/minúsculas
            },
            { 
              author: { name: { contains: query, mode: "insensitive" } } 
            },
          ],
        }
      : {}; // Si no hay query, el filtro está vacío (trae todo)

    // 3. Ejecutar las consultas a la base de datos
    // Usamos Promise.all para hacer el conteo y la búsqueda al mismo tiempo (más rápido)
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        include: { author: true },
        skip: skip,     // Saltar los de páginas anteriores
        take: pageSize, // Tomar solo la cantidad definida (12)
        orderBy: { title: 'asc' } // Opcional: ordenar alfabéticamente
      }),
      prisma.book.count({ where: whereClause }), // Contar cuántos coinciden en total
    ]);

    // 4. Retornar la respuesta con la estructura que esperabas
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