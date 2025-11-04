import type { APIRoute } from 'astro';
import { comments, replies } from '../../data/mock-db';
import type { Comment, Reply } from '../../data/mock-db';

export const POST: APIRoute = async ({ request }) => {
  const { commentId, title, text, bookId, username } = await request.json();

  if (!commentId || !title || !text || !bookId) {
    return new Response(JSON.stringify({ error: "commentId, title, text y bookId son obligatorios" }), { status: 400 });
  }

  const newCommentReply: Comment = {
    id: String(Date.now()),
    bookId,
    username: username ?? "Anónimo",
    title: `Re: ${title}`,
    text,
    likes: 0,
    timestamp: new Date(),
  };
  comments.push(newCommentReply);

  const newReplyLink: Reply = {
    commentId: commentId,
    replyId: newCommentReply.id,
  };
  replies.push(newReplyLink);

  return new Response(JSON.stringify({ 
      message: "Respuesta creada",
      replyLink: newReplyLink, 
      newComment: newCommentReply 
  }), { status: 201 });
};

export const DELETE: APIRoute = ({ url }) => {
  const replyIdToDelete = url.searchParams.get('id');

  if (!replyIdToDelete) {
    return new Response(JSON.stringify({ message: "No se proporcionó el parámetro 'id' en la URL" }), { status: 400 });
  }

  const commentIndex = comments.findIndex(comment => comment.id === replyIdToDelete);
  
  if (commentIndex === -1) {
    return new Response(JSON.stringify({ message: "Respuesta no encontrada" }), { status: 404 });
  }
  comments.splice(commentIndex, 1);

  const replyLinkIndex = replies.findIndex(reply => reply.replyId === replyIdToDelete);
  if (replyLinkIndex > -1) {
    replies.splice(replyLinkIndex, 1);
  }

  return new Response(JSON.stringify({ message: "Respuesta eliminada correctamente" }), { status: 200 });
};