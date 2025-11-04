import type { APIRoute } from "astro";
import { comments } from "./comments"; 

export const prerender = false;

type Reply = {
  id_comment: number; 
  id_reply: number;   
};

export let replies: Reply[] = []; 

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const commentId = url.searchParams.get("id_comment");

  if (commentId) {
    const filtered = replies.filter(r => r.id_comment === Number(commentId));
    return new Response(JSON.stringify(filtered), { status: 200 });
  }

  return new Response(JSON.stringify(replies), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id_comment, title, description, book_id } = body;

    if (!id_comment || !title || !description || !book_id) {
      return new Response(
        JSON.stringify({ error: "id_comment, title, description y book_id son obligatorios" }),
        { status: 400 }
      );
    }

    const newComment = {
      id: comments.length + 1,
      title,
      description,
      like: 0,
      book_id,
    };
    comments.push(newComment);

    const newReply: Reply = {
      id_comment: Number(id_comment),
      id_reply: newComment.id,
    };
    replies.push(newReply);

    return new Response(
      JSON.stringify({ reply: newReply, comment: newComment }),
      { status: 201 }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Error procesando reply" }), { status: 500 });
  }
};
