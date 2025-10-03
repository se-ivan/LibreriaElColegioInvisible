import type { APIRoute } from 'astro';
import { books } from '../../../data/mock-db';

export const GET: APIRoute = ({ params }) => {
  const book = books.find(b => b.id === params.id);
  if (!book) {
    return new Response(JSON.stringify({ message: 'Libro no encontrado' }), { status: 404 });
  }
  return new Response(JSON.stringify(book));
};