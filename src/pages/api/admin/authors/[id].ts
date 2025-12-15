
import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma'; 
import { Prisma } from '@prisma/client'; 

export const GET: APIRoute = async ({ params }) => {
    const autorIdString = params.id;
    
    const autorId = parseInt(autorIdString as string, 10); // Base 10
    
    if (!autorId) {
        return new Response(JSON.stringify({ error: 'Falta el ID del autor.' }), { status: 400 });
    }

    try {
        const autor = await prisma.author.findUnique({
            where: { id: autorId },
        });

        if (isNaN(autorId)) {
            return new Response(JSON.stringify({ error: 'Autor no encontrado.' }), { status: 404 });
        }

        return new Response(JSON.stringify(autor), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('Error al obtener el autor:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), { status: 500 });
    }
};


export const PUT: APIRoute = async ({ request, params }) => {
    const autorIdString = params.id;
    
    const autorId = parseInt(autorIdString as string, 10); // Base 10

    if (isNaN(autorId)) {
        return new Response(JSON.stringify({ error: 'Falta el ID del autor.' }), { status: 400 });
    }

    try {
        const body = await request.json();
        const { name, lastName, biography, birthdate, imageUrl, nationality, genre } = body;

        if (!name || !lastName || !biography || !birthdate) {
             return new Response(JSON.stringify({ error: 'Faltan campos obligatorios para actualizar.' }), { status: 400 });
        }
        
        const birthdateDate = new Date(birthdate);

        const updatedAuthor = await prisma.author.update({
            where: { id: autorId },
            data: {
                name,
                lastName,
                biography,
                birthdate: birthdateDate,
                imageUrl: imageUrl || null, 
                nationality: nationality || null,
                genre: genre || null
            },
        });

        return new Response(JSON.stringify(updatedAuthor), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('Error al actualizar el autor:', error);
        
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return new Response(JSON.stringify({ error: 'Autor no encontrado para actualizar.' }), { status: 404 });
        }
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), { status: 500 });
    }
};


export const DELETE: APIRoute = async ({ params }) => {
    const autorIdString = params.id;
    
    const autorId = parseInt(autorIdString as string, 10); // Base 10

    if (isNaN(autorId)) {
        return new Response(JSON.stringify({ error: 'Falta el ID del autor.' }), { status: 400 });
    }

    try {
        const hasBooks = await prisma.book.count({
            where: { id: autorId },
        });

        if (hasBooks > 0) {
            return new Response(JSON.stringify({ 
                error: 'No se puede eliminar el autor porque tiene libros asignados.' 
            }), { status: 409 });
        }
        
        await prisma.author.delete({
            where: { id: autorId },
        });

        return new Response(null, { status: 204 }); // 204 No Content para éxito

    } catch (error) {
        console.error('Error al eliminar el autor:', error);
         if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return new Response(JSON.stringify({ error: 'Autor no encontrado para eliminar.' }), { status: 404 });
        }
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), { status: 500 });
    }
};