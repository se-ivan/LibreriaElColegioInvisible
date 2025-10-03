import type { APIRoute } from 'astro';
import { comments, replies } from '../../data/mock-db';
import type { Comment } from '../../data/mock-db';

export const GET: APIRoute = ({ url }) => {
  const bookId = url.searchParams.get("bookId");
  if (bookId) {
    const filtered = comments.filter(c => c.bookId === bookId);
    return new Response(JSON.stringify(filtered), { status: 200 });
  }
  return new Response(JSON.stringify(comments), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  const { title, text, bookId, username } = await request.json();
  if (!title || !text || !bookId) {
    return new Response(JSON.stringify({ error: "title, text y bookId son obligatorios" }), { status: 400 });
  }
  const newComment: Comment = {
    id: String(Date.now()),
    bookId,
    username: username ?? "Anónimo",
    title,
    text,
    likes: 0,
    timestamp: new Date(),
  };
  comments.push(newComment);
  return new Response(JSON.stringify(newComment), { status: 201 });
};

export const DELETE: APIRoute = ({ url }) => {
  const commentIdToDelete = url.searchParams.get('id');
  if (!commentIdToDelete) {
    return new Response(JSON.stringify({ message: "No se proporcionó el parámetro 'id' en la URL" }), { status: 400 });
  }

  const commentIndex = comments.findIndex(comment => comment.id === commentIdToDelete);
  if (commentIndex === -1) {
    return new Response(JSON.stringify({ message: "Comentario no encontrado" }), { status: 404 });
  }
  comments.splice(commentIndex, 1);
  const repliesToKeep = replies.filter(reply => 
    reply.commentId !== commentIdToDelete && reply.replyId !== commentIdToDelete
  );

  replies.length = 0;
  replies.push(...repliesToKeep);

  return new Response(JSON.stringify({ message: "Comentario y enlaces relacionados eliminados" }), { status: 200 });
};