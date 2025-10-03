import type { APIRoute } from 'astro';
import { books } from '../../data/mock-db';

export const GET: APIRoute = () => {
  if (books.length === 0) {
    return new Response(null, { status: 204 });
  }
  const bookOfTheMonth = books.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);
  return new Response(JSON.stringify(bookOfTheMonth));
};