import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';

export const GET: APIRoute = async () => {
  try {
    const books = await prisma.book.findMany();

    // En Astro, debes retornar un objeto Response estándar
    return new Response(JSON.stringify(books), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error('Error obteniendo libros:', error);
    
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}