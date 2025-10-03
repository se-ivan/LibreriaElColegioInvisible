import type { APIRoute } from 'astro';
import { books } from '../../../../data/mock-db';

export const PUT: APIRoute = async ({ params, request }) => {
  const bookIndex = books.findIndex(b => b.id === params.id);
  if (bookIndex === -1) return new Response(null, { status: 404 });
  
  const body = await request.json();
  books[bookIndex] = { ...books[bookIndex], ...body };
  return new Response(JSON.stringify(books[bookIndex]));
};