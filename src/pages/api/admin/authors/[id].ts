import type { APIRoute } from 'astro';
import { authors, books } from '../../../../data/mock-db';

export const PUT: APIRoute = async ({ params, request }) => {
  const authorIndex = authors.findIndex(a => a.id === params.id);
  if (authorIndex === -1) {
    return new Response(JSON.stringify({ message: 'Autor no encontrado' }), { status: 404 });
  }
  
  const body = await request.json();
  authors[authorIndex] = { ...authors[authorIndex], ...body };
  
  return new Response(JSON.stringify(authors[authorIndex]), { status: 200 });
};

export const DELETE: APIRoute = ({ params }) => {
  const hasBooks = books.some(book => book.authorId === params.id);
  if (hasBooks) {
    return new Response(JSON.stringify({ message: 'No se puede eliminar el autor porque tiene libros asignados.' }), { status: 409 });
  }

  const authorIndex = authors.findIndex(a => a.id === params.id);
  if (authorIndex === -1) {
    return new Response(JSON.stringify({ message: 'Autor no encontrado' }), { status: 404 });
  }

  authors.splice(authorIndex, 1);
  return new Response(JSON.stringify({ message: 'Autor eliminado correctamente' }), { status: 200 });
};