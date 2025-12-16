import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';
import type { Comment } from '../../../data/mock-db';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const bookId = url.searchParams.get("bookId");
    const pageSize = 10;
    
    if (!bookId) {
    return new Response(JSON.stringify({ error: "Falta el parámetro bookId" }), { status: 400 });
  }

    try {
        const comments = await prisma.comment.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        lastName: true,
                    },
                },
                replies: true,
            },
            where: {
                bookId: Number(url.searchParams.get('bookId')) || undefined,
            },

            orderBy: {
                id: 'desc',
            },
            take:pageSize,
            skip: (page - 1) * pageSize,
        });

        return new Response(JSON.stringify(comments), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error cargando comentarios:", error);
        return new Response(JSON.stringify({ error: "Error interno" }), { status: 500 });
    }
};

type CreateCommentPayload = Omit<Comment, 'id' | 'user' | 'replies' | 'like'>;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: CreateCommentPayload = await request.json();

    if (!body.title || !body.description || !body.userId || !body.bookId) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios (title, description, userId, bookId).' }), { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        title: body.title,
        description: body.description,
        userId: body.userId,
        bookId: body.bookId,
      },
    });

    return new Response(JSON.stringify(newComment),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error al crear el comentario:', error);

    return new Response(JSON.stringify({ error: 'Error interno del servidor al crear el comentario.' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};