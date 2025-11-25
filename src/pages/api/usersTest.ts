import type { APIRoute } from "astro";
import prisma from "../lib/prisma";

export const GET: APIRoute = async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
            }
        });

        return new Response(JSON.stringify(users), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Error al obtener usuarios" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}