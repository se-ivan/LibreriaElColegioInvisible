import prisma from '../pages/lib/prisma'; 
import { defineAction } from 'astro:actions';
import z from 'zod';
import { Prisma } from '@prisma/client';
import { uploadImage, deleteImageByUrl } from '../utils/cloudinary'; // Ruta para cloudinary

const cleanOptional = (value: string | null | undefined) => 
    (value === '' || value === null) ? undefined : value;

const authorSchema = z.object({
    id: z.coerce.number().int().optional(), 
    name: z.string().min(1, "El nombre es obligatorio."),
    lastName: z.string().min(1, "El apellido es obligatorio."),
    biography: z.string().min(1, "La biografía es obligatoria."),
    birthdate: z.string().transform((str) => new Date(str)), 
    
    // Se pide archivo opcional
    imageFile: z.instanceof(File).optional(),

    nationality: z.string().nullable().optional(),
    genre: z.string().nullable().optional(),
});

export const authorActions = {

    create: defineAction({
        accept: "form",
        input: authorSchema.omit({ id: true }), 
        handler: async (data) => {
            const { imageFile, ...authorData } = data;
            let imageUrl: string | undefined = undefined;

            // Lógica de subida de imagen
            if (imageFile && imageFile.size > 0) {
                try {
                    imageUrl = await uploadImage(imageFile);
                } catch (error) {
                    console.error(error);
                    throw new Error("Error al subir la imagen a Cloudinary.");
                }
            }

            try {
                const newAuthor = await prisma.author.create({
                    data: {
                        ...authorData,
                        imageUrl: imageUrl, // Guardamos la URL de Cloudinary
                        nationality: cleanOptional(authorData.nationality),
                        genre: cleanOptional(authorData.genre),
                    },
                });
                return { success: true, author: newAuthor };
            } catch (e) {
                console.error("Error al crear autor:", e);
                throw new Error("Error de base de datos al crear el autor.");
            }
        },
    }),

    update: defineAction({
        accept: "form",
        input: authorSchema.extend({
            id: z.coerce.number().int({ message: "El ID es inválido." }),
        }),
        handler: async (data) => {
            const { id, imageFile, ...originalUpdateData } = data; 
            
            const updateData: any = {
                ...originalUpdateData,
                nationality: cleanOptional(originalUpdateData.nationality),
                genre: cleanOptional(originalUpdateData.genre),
            };

            // Solo se sube imagen si el usuario seleccionó una nueva
            if (imageFile && imageFile.size > 0) {
                try {
                    const newImageUrl = await uploadImage(imageFile);
                    updateData.imageUrl = newImageUrl; // Sobrescribimos la URL anterior
                } catch (error) {
                    console.error(error);
                    throw new Error("Error al subir la nueva imagen.");
                }
            }
            // Si no hay imageFile, no tocamos el campo imageUrl en la BD entonces se queda el anterior

            try {
                const updatedAuthor = await prisma.author.update({
                    where: { id: id },
                    data: updateData,
                });
                return { success: true, author: updatedAuthor };
            } catch (e) {
                if (e instanceof Error) {
                      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                        throw new Error("Autor no encontrado para actualizar.");
                    }
                }
                console.error("Error al actualizar autor:", e);
                throw new Error("Error de base de datos al actualizar el autor.");
            }
        },
    }),

    delete: defineAction({
        accept: "json",
        input: z.object({
            id: z.number().int({ message: "El ID debe ser un número entero." }),
        }),
        handler: async ({ id }) => {
            // Busca el autor antes de intentar borrarlo
            const authorToDelete = await prisma.author.findUnique({
                where: { id: id },
                select: { imageUrl: true } // Solo necesitamos la URL
            });
            
            if (!authorToDelete) {
                throw new Error("Autor no encontrado para eliminar.");
            }

            try {
                // Verificar si tiene libros antes de borrar
                const hasBooks = await prisma.book.count({
                    where: { authorId: id },
                });

                if (hasBooks > 0) {
                    throw new Error("No se puede eliminar el autor porque tiene libros asignados.");
                }
                
                // Elimina la imagen de Cloudinary si existe
                if (authorToDelete.imageUrl) {
                    await deleteImageByUrl(authorToDelete.imageUrl); 
                }
                
                // Elimina el registro de la DB
                await prisma.author.delete({
                    where: { id: id },
                });

                return { success: true, message: `Autor ID ${id} eliminado.` };
            } catch (e) {
                if (e instanceof Error) {
                    if (e.message.includes("libros asignados")) {
                        throw new Error(e.message);
                    }
                }
                console.error("Error al eliminar autor:", e);
                throw new Error("Error interno al eliminar el autor.");
            }
        },
    }),
};