import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import fs from "fs";
import path from "path";

interface Post {
  id: number;
  title: string;
  description: string;
  image: string | null;
  date: string;
  pretitle:string;
}

const postsFile = path.join(process.cwd(), "src/content/posts/posts.json");

function getImagePath(post: CollectionEntry<'posts'>): string | null {

  const avatar: any = (post.data as any).avatar;
  if (!avatar) return null;

 
  if (typeof avatar === "string") return avatar;

  
  if (avatar.src) {
    
    if (typeof avatar.src === "string") {
      return avatar.src.startsWith("/src/") ? avatar.src.replace(/^\/src/, "") : avatar.src;
    }
  }
  if (avatar.filename) {
    
    return `/content/posts/${post.slug}/${avatar.filename}`;
  }

  
  return null;
}

export const POST: APIRoute = async () => {
  try {
    
    const keystaticPosts: CollectionEntry<'posts'>[] = await getCollection('posts');

   
    const posts: Post[] = keystaticPosts.map((post, index) => ({
      id: index + 1,
      title: (post.data as any).title ?? "",
      description: (post.data as any).description ?? "",
      pretitle: (post.data as any).quote ?? "",
      image: getImagePath(post),
      date: new Date().toISOString(), 
    }));

    
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2), "utf-8");

    return new Response(JSON.stringify({ message: "Posts guardados", count: posts.length }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error al guardar posts" }), { status: 500 });
  }
};

export const GET: APIRoute = async () => {
  try {
    if (fs.existsSync(postsFile)) {
      const posts = JSON.parse(fs.readFileSync(postsFile, "utf-8"));
      return new Response(JSON.stringify(posts), { status: 200 });
    }
    return new Response(JSON.stringify([]), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error al obtener posts" }), { status: 500 });
  }
};
