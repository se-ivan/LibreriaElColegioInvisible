import prisma from '../pages/lib/prisma'; 
import { defineAction } from 'astro:actions';
import z from 'zod';
import { Prisma } from '@prisma/client';
import { uploadImage, deleteImageByUrl } from '../utils/cloudinary'; // Ruta para cloudinary

const cleanOptional = (value: string | null | undefined) => 
    (value === '' || value === null) ? undefined : value;


const logServerEvent = (level: 'INFO' | 'ERROR' | 'WARN', module: string, message: string, meta?: any) => {
    const logPayload = JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        service: 'author-service',
        module,
        message,
        ...meta 
    });

    if (level === 'ERROR') {
        console.error(logPayload);
    } else {
        console.log(logPayload);
    }
};

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
                    // LOG DE ERROR (IMAGEN)
                    logServerEvent('ERROR', 'AUTHORS:CREATE:IMAGE', 'Fallo al subir imagen a Cloudinary', { error: String(error) });
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

                // LOG DE ÉXITO
                logServerEvent('INFO', 'AUTHORS:CREATE', 'Autor creado exitosamente', { authorId: newAuthor.id, authorName: newAuthor.name });
                
                return { success: true, author: newAuthor };
            } catch (e) {
                //  LOG DE ERROR (DB)
                logServerEvent('ERROR', 'AUTHORS:CREATE:DB', 'Error de base de datos al crear autor', { errorDetail: e instanceof Error ? e.message : e });
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

            if (imageFile && imageFile.size > 0) {
                try {
                    const newImageUrl = await uploadImage(imageFile);
                    updateData.imageUrl = newImageUrl; 
                } catch (error) {
                    // LOG DE ERROR (IMAGEN)
                    logServerEvent('ERROR', 'AUTHORS:UPDATE:IMAGE', 'Fallo al subir nueva imagen', { authorId: id, error: String(error) });
                    throw new Error("Error al subir la nueva imagen.");
                }
            }
            // Si no hay imageFile, no tocamos el campo imageUrl en la BD

            try {
                const updatedAuthor = await prisma.author.update({
                    where: { id: id },
                    data: updateData,
                });

                // LOG DE ÉXITO
                logServerEvent('INFO', 'AUTHORS:UPDATE', 'Autor actualizado exitosamente', { authorId: id });

                return { success: true, author: updatedAuthor };
            } catch (e) {
                if (e instanceof Error) {
                      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                        // LOG DE WARNING
                        logServerEvent('WARN', 'AUTHORS:UPDATE', 'Intento de actualizar autor inexistente', { authorId: id });
                        throw new Error("Autor no encontrado para actualizar.");
                    }
                }
                
                // LOG DE ERROR
                logServerEvent('ERROR', 'AUTHORS:UPDATE:DB', 'Error crítico al actualizar autor', { authorId: id, errorDetail: String(e) });
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
           
            const authorToDelete = await prisma.author.findUnique({
                where: { id: id },
                select: { imageUrl: true } 
            });
            
            if (!authorToDelete) {
                logServerEvent('WARN', 'AUTHORS:DELETE', 'Intento de eliminar autor inexistente', { authorId: id });
                throw new Error("Autor no encontrado para eliminar.");
            }

            try {
                const hasBooks = await prisma.book.count({
                    where: { authorId: id },
                });

                if (hasBooks > 0) {
                    logServerEvent('WARN', 'AUTHORS:DELETE', 'Bloqueo de eliminación: Autor tiene libros', { authorId: id, bookCount: hasBooks });
                    throw new Error("No se puede eliminar el autor porque tiene libros asignados.");
                }
                
                if (authorToDelete.imageUrl) {
                    await deleteImageByUrl(authorToDelete.imageUrl); 
                    logServerEvent('INFO', 'AUTHORS:DELETE:IMAGE', 'Imagen eliminada de Cloudinary', { authorId: id });
                }
                
                await prisma.author.delete({
                    where: { id: id },
                });

                // LOG DE ÉXITO
                logServerEvent('INFO', 'AUTHORS:DELETE', 'Autor eliminado permanentemente', { authorId: id });

                return { success: true, message: `Autor ID ${id} eliminado.` };
            } catch (e) {
                if (e instanceof Error) {
                    if (e.message.includes("libros asignados")) {
                        throw new Error(e.message);
                    }
                }
                
                // LOG DE ERROR
                logServerEvent('ERROR', 'AUTHORS:DELETE:DB', 'Fallo al eliminar autor', { authorId: id, errorDetail: String(e) });
                throw new Error("Error interno al eliminar el autor.");
            }
        },
    }),
};