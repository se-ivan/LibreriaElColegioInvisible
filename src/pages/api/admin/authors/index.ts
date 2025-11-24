import type { APIRoute } from "astro";
import prisma from "../../../../lib/prisma";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (!body.name || !body.lastName || !body.biography || !body.birthdate) {
      return new Response(
        JSON.stringify({ 
          message: "Faltan datos obligatorios: name, lastName, biography, birthdate" 
        }), 
        { status: 400 }
      );
    }

    const newAuthor = await prisma.author.create({
      data: {
        name: body.name,
        lastName: body.lastName,
        biography: body.biography,
        birthdate: new Date(body.birthdate), 
        imageUrl: body.imageUrl || null,
      },
    });

    return new Response(JSON.stringify(newAuthor), { status: 201 });

  } catch (error) {
    console.error("Error creando autor:", error);
    return new Response(
      JSON.stringify({ error: "Error interno al crear autor" }), 
      { status: 500 }
    );
  }
};