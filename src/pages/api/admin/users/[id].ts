import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma'; 
import { Prisma } from '@prisma/client'; 


export const PATCH: APIRoute = async ({ request, params }) => {
    const userId = params.id;

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Falta el ID del usuario.' }), { status: 400 });
    }

    try {
        const body = await request.json();
        const { isUser } = body; 

        if (typeof isUser !== 'boolean') {
             return new Response(JSON.stringify({ error: 'El campo isUser debe ser un booleano.' }), { status: 400 });
        }
       
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                isUser: isUser,
               
            },
          
            select: {
                id: true,
                email: true,
                name: true,
                isUser: true,
            }
        });

        return new Response(JSON.stringify(updatedUser), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return new Response(JSON.stringify({ error: 'Usuario no encontrado.' }), { status: 404 });
        }
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), { status: 500 });
    }
};