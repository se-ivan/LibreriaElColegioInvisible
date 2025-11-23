import type { APIRoute } from 'astro';
//import { authors } from '../../../data/mock-db';
import prisma from '../../lib/prisma'; 
import { Prisma } from '@prisma/client';

export const GET: APIRoute = async ({ params }) => {
  const authorId = parseInt(params.id || '0');

  if (isNaN(authorId) || authorId === 0) {
    return new Response(JSON.stringify({ error: 'ID de autor no valido' }), { status: 404, headers:{ 'Content-Type': 'application/json' } });
  }
  try {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      include: { 
        _count: {
          select: {
            books: true
          }
        }
      }
    });

    if (!author) {
      return new Response(JSON.stringify({ error: `Autor con ID ${authorId} no encontrado.` }),{ status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(
      JSON.stringify(author),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error al obtener el autor:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};


export const PATCH: APIRoute = async ({ params, request }) => {
  const authorId = parseInt(params.id || '0');

  if (isNaN(authorId) || authorId === 0) {
    return new Response(JSON.stringify({ error: 'ID de autor inválido.' }),{ status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    
    const updateData: { [key: string]: any } = {};
    
    const validFields = ['name', 'lastName', 'biography', 'birthdate', 'imageUrl'];

    for (const field of validFields) {
        if (body[field] !== undefined) {
            updateData[field] = body[field];
        }
    }
    

    if (updateData.birthdate) {
        const birthdateDate = new Date(updateData.birthdate);
        if (isNaN(birthdateDate.getTime())) {
             return new Response(JSON.stringify({ error: 'El campo birthdate no tiene un formato de fecha válido.' }),{ status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        updateData.birthdate = birthdateDate;
    }

    const updatedAuthor = await prisma.author.update({
      where: { id: authorId },
      data: updateData,
    });

    return new Response(JSON.stringify(updatedAuthor),{ status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error al actualizar el autor:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
       
        return new Response(JSON.stringify({ error: `Autor con ID ${authorId} no encontrado.` }),{ status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ error: 'Ocurrió un error interno al actualizar el autor.' }),{ status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};



export const DELETE: APIRoute = async ({ params }) => {
  const authorId = parseInt(params.id || '0');

  if (isNaN(authorId) || authorId === 0) {
    return new Response(JSON.stringify({ error: 'ID de autor inválido.' }),{ status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    
    const deletedAuthor = await prisma.author.delete({
      where: { id: authorId },
    });

    return new Response(null, { status: 204 });

  } catch (error) {
    console.error('Error al eliminar el autor:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return new Response(
            JSON.stringify({ error: `Autor con ID ${authorId} no encontrado.` }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }
    
    return new Response(JSON.stringify({ error: 'Ocurrió un error interno al eliminar el autor.' }),{ status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};