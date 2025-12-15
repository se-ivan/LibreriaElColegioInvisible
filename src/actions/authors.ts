
import prisma from '../pages/lib/prisma'; 
import { defineAction } from 'astro:actions';
import z from 'zod';
import { Prisma } from '@prisma/client';

const cleanOptional = (value: string | null | undefined) => 
    (value === '' || value === null) ? undefined : value;

const authorSchema = z.object({
    id: z.coerce.number().int().optional(), 
    name: z.string().min(1, "El nombre es obligatorio."),
    lastName: z.string().min(1, "El apellido es obligatorio."),
    biography: z.string().min(1, "La biografía es obligatoria."),
    birthdate: z.string().transform((str) => new Date(str)), 
    imageUrl: z.string().url().nullable().optional(),
    nationality: z.string().nullable().optional(),
    genre: z.string().nullable().optional(),
});


export const authorActions = {

    create: defineAction({
        accept: "form",
   
        input: authorSchema.omit({ id: true }), 
        handler: async (data) => {

            try {
                const newAuthor = await prisma.author.create({
                    data: {
                        ...data,
                        imageUrl: cleanOptional(data.imageUrl),
                        nationality: cleanOptional(data.nationality),
                        genre: cleanOptional(data.genre),
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
            const { id, ...originalUpdateData } = data; 
            const updateData = {
                ...originalUpdateData,
                imageUrl: cleanOptional(originalUpdateData.imageUrl),
                nationality: cleanOptional(originalUpdateData.nationality),
                genre: cleanOptional(originalUpdateData.genre),
            };

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
            try {
                const hasBooks = await prisma.book.count({
                    where: { authorId: id },
                });

                if (hasBooks > 0) {
                    throw new Error("No se puede eliminar el autor porque tiene libros asignados.");
                }
                
                await prisma.author.delete({
                    where: { id: id },
                });

                return { success: true, message: `Autor ID ${id} eliminado.` };
            } catch (e) {
                
                if (e instanceof Error) {

                    if (e.message.includes("libros asignados")) {
                        throw new Error(e.message);
                    }

                    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                        throw new Error("Autor no encontrado para eliminar.");
                    }
                }
                
                console.error("Error al eliminar autor:", e);
                throw new Error("Error interno al eliminar el autor.");
            }
        },
    }),
};