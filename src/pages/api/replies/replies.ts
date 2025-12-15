import type { APIRoute } from "astro";
import prisma from '../../lib/prisma'; 

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const commentIdParam = url.searchParams.get("id_comment");
    
    if (!commentIdParam) {
        return new Response(
            JSON.stringify({ error: "El parámetro 'id_comment' es obligatorio." }),
            { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
    
    const commentId = Number(commentIdParam);
    if (isNaN(commentId)) {
        return new Response(
            JSON.stringify({ error: "El 'id_comment' debe ser un número válido." }),
            { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }

    try {
        
        const commentWithReplies = await prisma.comment.findUnique({
            where: {
                id: commentId,
            },
            select: {
                replies: {
                    select: {
                        id: true, 
                        commentId: true, 
                    }
                }
            }
        });

        if (!commentWithReplies) {
            return new Response(
                JSON.stringify({ error: "Comentario no encontrado." }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify(commentWithReplies.replies), 
            { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );

    } catch (error) {
        console.error('Error al obtener las respuestas:', error);
        
        return new Response(
            JSON.stringify({ error: 'Error interno del servidor al obtener respuestas.' }),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
};


interface ReplyBody {
    commentId: number;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body: ReplyBody = await request.json();
        const { commentId } = body;

        if (!commentId) {
            return new Response(
                JSON.stringify({ error: "El campo 'commentId' es obligatorio." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const newReply = await prisma.reply.create({
            data: {
                commentId: commentId,
            },
        });

        return new Response(
            JSON.stringify(newReply),
            { 
                status: 201, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );

    } catch (error) {
        console.error('Error al crear la respuesta:', error);
        
        return new Response(
            JSON.stringify({ error: 'Error interno del servidor al crear la respuesta.' }),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
};