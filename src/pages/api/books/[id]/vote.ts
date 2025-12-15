import type { APIRoute } from 'astro';
import { books } from '../../../../data/mock-db';

export const POST: APIRoute = ({ params }) => {
  const bookIndex = books.findIndex(b => b.id === params.id);
  if (bookIndex === -1) {
    return new Response(JSON.stringify({ message: 'Libro no encontrado' }), { status: 404 });
  }
  books[bookIndex].votes++;
  return new Response(JSON.stringify(books[bookIndex]), { status: 200 });
};