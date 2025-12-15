import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 8);
  const search = url.searchParams.get("search") || undefined;
  
  const skip = (page - 1) * pageSize;

  const where = search 
    ? { OR: [{ title: { contains: search } }] } 
    : undefined;

  try {
    const [booksRaw, total] = await Promise.all([
      prisma.book.findMany({
        skip,
        take: pageSize,
        where,
        include: { author: true },
        orderBy: { id: 'desc' }   
      }),
      prisma.book.count({ where }),
    ]);

    const books = booksRaw.map(b => ({
        ...b,
        price: Number(b.price),
        coverImage: b.imageUrl || null 
    }));

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