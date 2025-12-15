import type { APIRoute } from "astro";
import prisma from '../lib/prisma';
import { getCollection } from "astro:content";
import Markdoc from "@markdoc/markdoc";


export const POST: APIRoute = async () => {
    try{
const user = await prisma.user.findFirst();
  if (!user) {
    return new Response(JSON.stringify({ error: "No hay usuarios en la BD. Crea uno primero." }), { status: 400 });
  }
  const posts = await getCollection("posts");

  let createdCount = 0;

  for (const post of posts) {
    const title = post.data.title;
   // const description = post.data.description;
    const pretitle = post.data.quote ?? null;
    const imageUrl = post.data.avatar ?? null;
    const description = post.data.description ?? "";


    const exists = await prisma.new.findFirst({ where: { title } });
    if (exists) continue;

    await prisma.new.create({
      data: {
        title,
        description,
        pretitle,
        imageUrl,
        userId: user.id,
      },
    });

    createdCount++;
  }

    return new Response(
      JSON.stringify({ message: `Importación completa (${createdCount} nuevos registros)` }),
      { status: 200 }
    );
  } catch (error) {
    console.error("ERROR IMPORTANDO NOTICIAS:", error);
    return new Response(JSON.stringify({ error: "Ocurrió un error, revisa la consola" }), { status: 500 });
  }
};
