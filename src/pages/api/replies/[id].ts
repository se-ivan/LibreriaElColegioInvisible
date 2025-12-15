import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma'; 

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
    const replyId = Number(params.id);

    if (isNaN(replyId)) {
        return new Response(
            JSON.stringify({ error: 'El ID de la respuesta debe ser un número válido.' }),
            { status: 400 }
        );
    }

    try {
        const reply = await prisma.reply.findUnique({
            where: {
                id: replyId,
            },
            include: {
                comment: {
                    select: { id: true, title: true, description: true }
                }
            }
        });

        if (!reply) {
            return new Response(
                JSON.stringify({ error: 'Respuesta no encontrada.' }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify(reply),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error al obtener la respuesta:', error);
        return new Response(
            JSON.stringify({ error: 'Error interno del servidor.' }),
            { status: 500 }
        );
    }
};



export const PATCH: APIRoute = async ({ params, request }) => {
    const replyId = Number(params.id);

    if (isNaN(replyId)) {
        return new Response(
            JSON.stringify({ error: 'El ID de la respuesta debe ser un número válido.' }),
            { status: 400 }
        );
    }

    try {
        const body = await request.json();
        const { commentId } = body;

        const dataToUpdate: { commentId?: number } = {};

        if (commentId !== undefined) {
            const newCommentId = Number(commentId);
            if (isNaN(newCommentId)) {
                 return new Response(
                    JSON.stringify({ error: 'El nuevo commentId no es un número válido.' }),
                    { status: 400 }
                );
            }
            dataToUpdate.commentId = newCommentId;
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return new Response(
                JSON.stringify({ error: 'No se proporcionaron datos para actualizar.' }),
                { status: 400 }
            );
        }

        const updatedReply = await prisma.reply.update({
            where: { id: replyId },
            data: dataToUpdate,
        });

        return new Response(JSON.stringify(updatedReply),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        if (error.code === 'P2025') {return new Response(
                JSON.stringify({ error: 'Respuesta no encontrada para actualizar.' }),
                { status: 404 }
            );
        }
        console.error('Error al actualizar la respuesta:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }),
            { status: 500 }
        );
    }
};

export const DELETE: APIRoute = async ({ params }) => {
    const replyId = Number(params.id);

    if (isNaN(replyId)) {
        return new Response(JSON.stringify({ error: 'El ID de la respuesta debe ser un número válido.' }),
            { status: 400 }
        );
    }

    try {
        await prisma.reply.delete({
            where: { id: replyId },
        });

        return new Response(null, { status: 204 });

    } catch (error: any) {
        if (error.code === 'P2025') {
            return new Response(JSON.stringify({ error: 'Respuesta no encontrada para eliminar.' }),
                { status: 404 }
            );
        }
        console.error('Error al eliminar la respuesta:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }),
            { status: 500 }
        );
    }
};