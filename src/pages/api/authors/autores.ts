import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma'; 
import { Prisma } from '@prisma/client'; 

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const { 
      name, 
      lastName, 
      biography, 
      birthdate, 
      imageUrl,
      nationality,
      genre 
    } = body;

    if (!name || !lastName || !biography || !birthdate) {
      return new Response(
        JSON.stringify({
          error: 'Faltan campos obligatorios: name, lastName, biography y birthdate.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const birthdateDate = new Date(birthdate);
    if (isNaN(birthdateDate.getTime())) {
        return new Response(
            JSON.stringify({
                error: 'El campo birthdate no tiene un formato de fecha válido.',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const newAuthor = await prisma.author.create({
      data: {
        name,
        lastName,
        biography,
        birthdate: birthdateDate,
        imageUrl: imageUrl || null, 
        nationality: nationality || null,
        genre 
      },
    });

    return new Response(
      JSON.stringify(newAuthor),
      { 
        status: 201, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', 
        } 
      }
    );

  } catch (error) {
    console.error('Error al crear el autor:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return new Response(
            JSON.stringify({ error: `Error de base de datos conocido: ${error.message}` }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
    
    if (error instanceof SyntaxError) {
        return new Response(
            JSON.stringify({ error: 'El cuerpo de la solicitud no es un JSON válido.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ error: 'Ocurrió un error interno al procesar la solicitud.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

