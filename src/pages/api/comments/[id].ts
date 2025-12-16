import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
    const commentId = Number(params.id);

    if (isNaN(commentId)) {
        return new Response(JSON.stringify({ error: 'El ID del comentario debe ser un número válido.' }),
            { status: 400 }
        );
    }

    try {
        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            },
            include: {
                user: {
                    select: { name: true, lastName: true, image: true }
                },
                book: {
                    select: { title: true }
                },
                replies: true, 
            },
        });

        if (!comment) {
            return new Response(JSON.stringify({ error: 'Comentario no encontrado.' }),
                { status: 404 }
            );
        }

        return new Response(JSON.stringify(comment),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error al obtener el comentario:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }),
            { status: 500 }
        );
    }
};



export const PATCH: APIRoute = async ({ params, request }) => {
    const commentId = Number(params.id);

    if (isNaN(commentId)) {
        return new Response(JSON.stringify({ error: 'El ID del comentario debe ser un número válido.' }),
            { status: 400 }
        );
    }

    try {
        const body = await request.json();
        const { title, description, like } = body;

        const dataToUpdate: { title?: string, description?: string, like?: number } = {};

        if (title !== undefined) dataToUpdate.title = title;
        if (description !== undefined) dataToUpdate.description = description;
        if (like !== undefined) dataToUpdate.like = Number(like); 

        if (Object.keys(dataToUpdate).length === 0) {
            return new Response(JSON.stringify({ error: 'No se proporcionaron datos para actualizar.' }),
                { status: 400 }
            );
        }

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: dataToUpdate,
        });

        return new Response(JSON.stringify(updatedComment),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        if (error.code === 'P2025') { 
            return new Response(JSON.stringify({ error: 'Comentario no encontrado para actualizar.' }),
                { status: 404 }
            );
        }
        console.error('Error al actualizar el comentario:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }),
            { status: 500 }
        );
    }
};

export const DELETE: APIRoute = async ({ params }) => {
    const commentId = Number(params.id);

    if (isNaN(commentId)) {
        return new Response(JSON.stringify({ error: 'El ID del comentario debe ser un número válido.' }),
            { status: 400 }
        );
    }

    try {
        await prisma.comment.delete({
            where: { id: commentId },
        });

        return new Response(null, { status: 204 }); 

    } catch (error: any) {
        if (error.code === 'P2025') {
            return new Response(JSON.stringify({ error: 'Comentario no encontrado para eliminar.' }),
                { status: 404 }
            );
        }
        console.error('Error al eliminar el comentario:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor.' }),
            { status: 500 }
        );
    }
};