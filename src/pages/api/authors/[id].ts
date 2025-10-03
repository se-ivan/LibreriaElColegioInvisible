import type { APIRoute } from 'astro';
import { authors } from '../../../data/mock-db';

export const GET: APIRoute = ({ params }) => {
  const author = authors.find(a => a.id === params.id);
  if (!author) {
    return new Response(JSON.stringify({ message: 'Autor no encontrado' }), { status: 404 });
  }
  return new Response(JSON.stringify(author));
};