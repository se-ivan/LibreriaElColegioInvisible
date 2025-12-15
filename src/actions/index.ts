import { comment } from "./comments";
import { monthlyBook } from "./book-month";
import { defineAction } from 'astro:actions';
import { authorActions } from "./authors.ts";
import { z } from 'astro:schema';
import prisma from '../lib/prisma';

export const server = {
  monthlyBook,
  comment,
  authorActions,
  getBooks: defineAction({
    input: z.object({
      page: z.number(),
      pageSize: z.number(),
      search: z.string().optional(),
    }),
    handler: async (input) => {
      const skip = (input.page - 1) * input.pageSize;
      
      const where = input.search 
        ? { 
            OR: [
              { title: { contains: input.search } }
            ]
          } 
        : undefined;

      try {
        const [booksRaw, total] = await Promise.all([
          prisma.book.findMany({
            skip,
            take: input.pageSize,
            where,
            include: { author: true },
            orderBy: { id: 'desc' }
          }),
          prisma.book.count({ where }),
        ]);

        const books = booksRaw.map(book => ({
            ...book,
            price: Number(book.price),
        }));

        return {
          books,
          total,
          totalPages: Math.ceil(total / input.pageSize),
          currentPage: input.page
        };
      } catch (e) {
        console.error("Error en Prisma (getBooks):", e);
        throw new Error("Error de base de datos");
      }
    },
  }),

  getBook: defineAction({
    input: z.object({
      id: z.number(),
    }),
    handler: async (input) => {
      try {
        const bookRaw = await prisma.book.findUnique({
          where: { id: input.id },
          include: { author: true },
        });

        if (!bookRaw) {
          throw new Error("Libro no encontrado");
        }

        const relatedRaw = await prisma.book.findMany({
          where: { id: { not: input.id } },
          take: 3,
          include: { author: true },
        });

        const book = {
            ...bookRaw,
            price: Number(bookRaw.price)
        };

        const relatedBooks = relatedRaw.map(b => ({
            ...b,
            price: Number(b.price)
        }));

        return { book, relatedBooks };

      } catch (error) {
        console.error("Error en Prisma (getBook):", error);
        throw new Error("No se pudo cargar el libro");
      }
    },
  }),
};
