import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma'; 

export const GET: APIRoute = async ({ url }) => { 
    try {

        const [authorsRaw, total] = await Promise.all([ 
            prisma.author.findMany({
                orderBy: {
                    lastName: 'asc', 
                },
                select: {
                    id: true,
                    name: true,
                    lastName: true,
                    biography: true,
                    imageUrl: true,
                    nationality: true,
                    genre: true,
                    _count: {
                        select: { books: true },
                    },
                },
            }),
            prisma.author.count(),
        ]);

        const authors = authorsRaw.map(author => ({
            ...author,
            id: Number(author.id), 
        }));
        
        return new Response(
            JSON.stringify({ 
                authors: authors,
                total: total,
            }),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json' 
                } 
            }
        );
    } catch (error) {
        console.error('Error al obtener todos los autores:', error);
        
        return new Response(
            JSON.stringify({ error: 'Error interno del servidor al obtener autores.' }),
            { 
                status: 500, 
                headers: { 
                    'Content-Type': 'application/json' 
                } 
            }
        );
    }
};