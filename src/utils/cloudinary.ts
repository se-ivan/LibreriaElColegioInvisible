import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary usando las variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Usar HTTPS
});

/**
 * Sube un archivo de imagen al servicio de Cloudinary.
 * @param file El objeto File obtenido del FormData en la Action.
 * @returns La URL segura del recurso subido.
 */
export async function uploadImage(file: File): Promise<string> {
  // Convertir el File (Blob) en un ArrayBuffer y luego en un Buffer de Node.js
  const buffer = Buffer.from(await file.arrayBuffer());

  // Convertir el Buffer a un Data URL (base64)
  // Esto es necesario para subirlo sin necesidad de guardarlo en el disco
  const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

  try {
    // Sube a cloudinary
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: 'astro-blog-authors', // Opcional: define una carpeta para organizar tus imágenes
      // Opcional: limitar el tamaño de la imagen en la nube para ahorrar espacio
      transformation: [
        { width: 800, crop: "scale" } 
      ]
    });

    return result.secure_url; // Devuelve la URL pública y segura
  } catch (error) {
    console.error("Error al subir la imagen a Cloudinary:", error);
    throw new Error("Fallo al cargar la imagen. Inténtalo de nuevo."); 
  }
}

export async function deleteImageByUrl(url: string): Promise<void> {
  if (!url) {
    return;
  }
  
  // Buscar la posición de la carpeta que definimos
  const folderName = 'astro-blog-authors/';
  const folderIndex = url.indexOf(folderName);

  if (folderIndex === -1) {
    console.warn("La URL no parece ser de Cloudinary con la carpeta esperada:", url);
    return; 
  }

  // Obtener la parte que comienza con el nombre de la carpeta
  const startOfPublicId = url.substring(folderIndex);
  
  // Quita la extensión del archivo (.jpg, .png)
  const lastDot = startOfPublicId.lastIndexOf('.');
  const publicId = lastDot !== -1 ? startOfPublicId.substring(0, lastDot) : startOfPublicId;


  try {
    // Llama al método de destrucción de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
        console.log(`Imagen ${publicId} eliminada exitosamente de Cloudinary.`);
    } else {
        // Puede ser 'not found' si la imagen ya había sido eliminada
        console.warn(`Cloudinary no pudo eliminar la imagen ${publicId}. Resultado: ${result.result}`);
    }

  } catch (error) {
    console.error(`Error al eliminar imagen ${publicId} de Cloudinary:`, error);
    // Nota: Aquí NO lanzamos el error, ya que no queremos que una falla en Cloudinary
    // impida que se elimine el registro de la base de datos local.
  }
}