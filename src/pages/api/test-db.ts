
import type { APIRoute } from "astro";
import prisma from "../../lib/prisma";

export const GET: APIRoute = async () => {
  try {

    const userCount = await prisma.user.count();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Database connection successful",
        userCount,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
