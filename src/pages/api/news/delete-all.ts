import prisma from "../../../lib/prisma";

export async function POST() {
  try {
    await prisma.new.deleteMany();

    return new Response(
      JSON.stringify({ message: "Todas las noticias fueron eliminadas correctamente." }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error al eliminar las noticias." }),
      { status: 500 }
    );
  }
}
