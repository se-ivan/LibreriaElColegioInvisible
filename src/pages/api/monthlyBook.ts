import type { APIRoute } from 'astro';
import prisma from '../lib/prisma';

export const GET: APIRoute = async () => {
  try {
    const book = await prisma.book.findFirst({
        orderBy: { votes: "desc" },
        include: {
            author: {
                select: {
                    name: true,
                    lastName: true,
                }
            } 
        }
    });

    return new Response(JSON.stringify(book), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error obteniendo libro del mes:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
};

