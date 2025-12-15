import type { APIRoute } from "astro";
import prisma from "../../../../lib/prisma"; 

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body.title || !body.isbn || !body.price || !body.authorId) {
      return new Response(
        JSON.stringify({ message: "Datos incompletos. Se requieren: title, isbn, price, authorId." }),
        { status: 400 }
      );
    }

    const newBook = await prisma.book.create({
      data: {
        title: body.title,
        isbn: body.isbn,
        price: parseFloat(body.price), 
        editorial: body.editorial || "Editorial no especificada",
        publicationYear: parseInt(body.publicationYear) || 2024,
        authorId: Number(body.authorId), 
      },
    });

    return new Response(JSON.stringify(newBook), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error al crear libro:", error);

    if (error.code === 'P2002') {
        return new Response(JSON.stringify({ error: "El ISBN ya existe, debe ser único." }), { status: 409 });
    }
    if (error.code === 'P2003') {
        return new Response(JSON.stringify({ error: "El ID de Autor no existe. Crea el autor primero." }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Error interno del servidor al crear libro" }), { status: 500 });
  }
};