import type { APIRoute } from "astro";
import { replies } from "./replies";

export const prerender = false;

type Comment = {
  id: number;
  title: string;
  description: string;
  like: number;
  book_id: number;
};

export let comments: Comment[] = []; 
 
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const bookId = url.searchParams.get("book_id");

  if (bookId) {
    const filtered = comments.filter(c => c.book_id === Number(bookId));
    return new Response(JSON.stringify(filtered), { status: 200 });
  }

  return new Response(JSON.stringify(comments), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, description, book_id } = body;

    if (!title || !description || !book_id) {
      return new Response(
        JSON.stringify({ error: "title, description y book_id son obligatorios" }),
        { status: 400 }
      );
    }

    const newComment: Comment = {
      id: comments.length + 1,
      title,
      description,
      like: 0,
      book_id,
    };

    comments.push(newComment);

    return new Response(JSON.stringify(newComment), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ error: "Error procesando comentario" }), { status: 500 });
  }
};


export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Falta el parámetro id" }), { status: 400 });
    }

    const commentId = Number(id);
    const index = comments.findIndex(c => c.id === commentId);

    if (index === -1) {
      return new Response(JSON.stringify({ error: "Comentario no encontrado" }), { status: 404 });
    }

    const deletedComment = comments.splice(index, 1)[0];

    const deletedReplies = replies.filter(
      r => r.id_comment === commentId || r.id_reply === commentId
    );

    for (let r of deletedReplies) {
      const idx = comments.findIndex(c => c.id === r.id_reply);
      if (idx !== -1) comments.splice(idx, 1);
    }

    for (let r of deletedReplies) {
      const idx = replies.findIndex(x => x === r);
      if (idx !== -1) replies.splice(idx, 1);
    }

    return new Response(
      JSON.stringify({
        message: "Comentario y todas sus respuestas eliminados",
        deletedComment,
        deletedReplies
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Error al eliminar comentario" }), { status: 500 });
  }
};