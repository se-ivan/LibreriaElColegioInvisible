import type { APIRoute } from 'astro';
import { authors } from '../../../../data/mock-db';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  if (!body.name) {
    return new Response(JSON.stringify({ error: "El nombre es obligatorio" }), { status: 400 });
  }

  const newAuthor = {
    id: String(Date.now()), 
    name: body.name,
    nationality: body.nationality ?? "Desconocida",
    birthDate: body.birthDate ?? null,
    bio: body.bio ?? "",
    imageUrl: body.imageUrl ?? '/img/author-default.jpg',
  };

  authors.push(newAuthor);
  return new Response(JSON.stringify(newAuthor), { status: 201 });
};