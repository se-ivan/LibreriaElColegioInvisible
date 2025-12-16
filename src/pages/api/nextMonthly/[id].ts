import prisma from "../../lib/prisma";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({ error: "ID requerido" }),
      { status: 400 }
    );
  }

  const numId = Number(id);
  if (isNaN(numId)) {
    return new Response(
      JSON.stringify({ error: "ID inválido" }),
      { status: 400 }
    );
  }

  const count = await prisma.book.count({
    where: { id: { not: numId } }
  });

  if (count === 0) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  const take = Math.min(3, count);
  const skip = Math.floor(Math.random() * Math.max(count - take + 1, 1));

  const relatedBooks = await prisma.book.findMany({
    where: { id: { not: numId } },
    skip,
    take,
    include: {
      author: {
        select: {
          name: true,
          lastName: true,
        }
      }
    }
  });

  return new Response(JSON.stringify(relatedBooks), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
