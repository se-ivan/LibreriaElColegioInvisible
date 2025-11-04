import type { APIRoute } from 'astro';
import { books } from '../../../../data/mock-db';

export const POST: APIRoute = async ({ request }) => {
  const { title, authorId, genre } = await request.json();
  if (!title || !authorId || !genre) {
    return new Response(JSON.stringify({ message: 'Datos incompletos' }), { status: 400 });
  }
  const newBook = {
    id: String(Date.now()),
    title,
    authorId,
    genre,
    coverImage: '/img/default.jpg',
    rating: 0,
    votes: 0,
  };
  books.push(newBook);
  return new Response(JSON.stringify(newBook), { status: 201 });
};