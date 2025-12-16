import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma'; 


export const GET: APIRoute = async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                isUser: true,
            },
            orderBy: {
                id: 'asc',
            }
        });

        if (!users || users.length === 0) {
            return new Response(JSON.stringify({ message: 'No se encontraron usuarios.' }), { status: 404 });
        }

        return new Response(JSON.stringify(users), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('Error al obtener la lista de usuarios:', error);
        return new Response(JSON.stringify({ error: 'Ocurrió un error interno al procesar la solicitud.' }), { status: 500 });
    }
};