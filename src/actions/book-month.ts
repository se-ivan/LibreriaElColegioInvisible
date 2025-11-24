import prisma from '../pages/lib/prisma';
import { defineAction } from 'astro:actions';
import z from 'zod';

export const monthlyBook = {
  bookOfTheMonth: defineAction({
    accept: "json",
    handler: async () => {
      const books = await prisma.book.findMany();

      if (books.length === 0) {
        return null;
      }

      const montlyBook = books.reduce((prev, current) => {
        return (prev.votes < current.votes) ? prev : current;
      });

      return montlyBook;
    },
  }),

  createBook: defineAction({
    accept: "json",
    input: z.object({
        title: z.string().min(1),
        isbn: z.string().min(10).max(13),
        price: z.number().min(0),
        editorial: z.string().min(1),
        publicationyear: z.number().min(0),
        authoId: z.number().min(1),
        votes: z.number().min(0).optional(),
    }),
    handler: async (data) => {
      const newBook = await prisma.book.create({
        data: {
          title: data.title,
          isbn: data.isbn,
          price: data.price,
          editorial: data.editorial,
          publicationYear: data.publicationyear,
          authorId: data.authoId,
          votes: data.votes || 0,
        },
      }); 
      return newBook;
    },
  }),

  getBooks: defineAction({
    accept: "json",
    handler: async () => {
      const books = await prisma.book.findMany();
      return books;
    },
  }),
};

