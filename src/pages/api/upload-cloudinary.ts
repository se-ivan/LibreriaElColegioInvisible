import type { APIRoute } from "astro";
import { v2 as cloudinary } from 'cloudinary';

// Configuración con claves privadas del servidor
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET
});

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const file = data.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ message: "No file found" }), { status: 400 });
  }

  // Convertir File a Buffer para Cloudinary
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    // Promesa para subir el buffer
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "libros" }, // Opcional: carpeta en cloudinary
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      // Escribir el buffer en el stream
      uploadStream.end(buffer);
    });

    return new Response(JSON.stringify({ url: uploadResult.secure_url }), {
      status: 200,
    });
  } catch (error) {
    console.error("Cloudinary error:", error);
    return new Response(JSON.stringify({ error: "Error uploading image" }), { status: 500 });
  }
};