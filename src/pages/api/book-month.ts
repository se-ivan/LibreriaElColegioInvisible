import prisma from '../lib/prisma';
import { defineAction } from 'astro:actions';


export const server = {
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
};

