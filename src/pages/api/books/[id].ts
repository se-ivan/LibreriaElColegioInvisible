import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma";

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "ID requerido" }), { status: 400 });
  }

  try {
    const bookRaw = await prisma.book.findUnique({
      where: { id: Number(id) },
      include: { author: true },
    });

    if (!bookRaw) {
      return new Response(JSON.stringify({ error: "No encontrado" }), { status: 404 });
    }

    const relatedRaw = await prisma.book.findMany({
      where: { id: { not: Number(id) } },
      take: 3,
      include: { author: true },
    });

    const book = { ...bookRaw, price: Number(bookRaw.price) };
    const relatedBooks = relatedRaw.map(b => ({ ...b, price: Number(b.price) }));

    return new Response(JSON.stringify({ book, relatedBooks }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error del servidor" }), { status: 500 });
  }
};