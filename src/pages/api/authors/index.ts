import type { APIRoute } from 'astro';
//import { authors } from '../../../data/mock-db';
import prisma from '../../lib/prisma'; 

export const GET: APIRoute = async () => {
    try {
        
        const authors = await prisma.author.findMany({
            select: {
                id: true,
                name: true,
                lastName: true,
                biography: true,
                birthdate: true,
                imageUrl: true,
                
                _count: {
                    select: { books: true },
                },
            },
            orderBy: {
                lastName: 'asc',
            }
        });
        return new Response(
            JSON.stringify(authors),
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