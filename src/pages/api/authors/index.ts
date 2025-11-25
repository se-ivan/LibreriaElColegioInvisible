import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma'; 

export const GET: APIRoute = async ({ url }) => { 
    try {
        const page = parseInt(url.searchParams.get('p') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '4'); 
        
        const skip = (page - 1) * limit;

        const [authors, total] = await Promise.all([
            prisma.author.findMany({
                skip: skip, 
                take: limit, 
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
        
        return new Response(
            JSON.stringify({ 
                authors: authors,
                total: total,
                currentPage: page,
                limit: limit,
                totalPages: Math.ceil(total / limit) 
            }),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json' 
                } 
            }
        );
    } catch (error) {
        console.error('Error al obtener los autores:', error);
        
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