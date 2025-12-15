import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import prisma from '../lib/prisma';
import logger from '../lib/logger'; 

export const server = {
  
  getAuthors: defineAction({
    handler: async () => {
      try {
        const authors = await prisma.author.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true, lastName: true }
        });
        return authors;
      } catch (e: any) {
        logger.error('Error al cargar autores', { error: e.message });
        throw new Error("Error al cargar autores");
      }
    }
  }),

  getBooks: defineAction({
    input: z.object({
      page: z.number(),
      pageSize: z.number(),
      search: z.string().optional(),
    }),
    handler: async (input) => {
      const skip = (input.page - 1) * input.pageSize;
      const where = input.search ? { OR: [{ title: { contains: input.search } }] } : undefined;

      try {
        logger.info('Solicitud de catálogo', { page: input.page, search: input.search });

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

        const books = (booksRaw as any[]).map(book => ({
            ...book,
            price: Number(book.price),
            coverImage: book.imageUrl || null 
        }));

        return {
          books,
          total,
          totalPages: Math.ceil(total / input.pageSize),
          currentPage: input.page
        };
      } catch (e: any) {
        logger.error('Error en getBooks', { error: e.message });
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
            include: { author: true } 
        });

        if (!bookRaw) {
          throw new Error("Libro no encontrado");
        }

        const relatedRaw = await prisma.book.findMany({ 
            where: { id: { not: input.id } }, 
            take: 3, 
            include: { author: true } 
        });
        
        const bookAny = bookRaw as any;

        const book = { 
            ...bookAny, 
            price: Number(bookAny.price), 
            coverImage: bookAny.imageUrl || null, 
            description: bookAny.description || null
        };
        
        const relatedBooks = (relatedRaw as any[]).map(b => ({ 
            ...b, 
            price: Number(b.price), 
            coverImage: b.imageUrl || null 
        }));

        return { book, relatedBooks };
      } catch (error: any) {
        logger.error('Error en getBook', { error: error.message, bookId: input.id });
        throw new Error("Error al cargar libro");
      }
    },
  }),

  addComment: defineAction({
    input: z.object({
      bookId: z.number(),
      userId: z.string(),
      title: z.string().min(3), 
      description: z.string().min(5), 
    }),
    handler: async (input) => {
      try {
        const existing = await prisma.comment.findFirst({
            where: {
                bookId: input.bookId,
                userId: input.userId
            }
        });

        if (existing) {
            throw new Error("Ya has publicado una reseña para este libro.");
        }
        
        const newComment = await prisma.comment.create({
          data: { 
            title: input.title, 
            description: input.description, 
            bookId: input.bookId, 
            userId: input.userId, 
            like: 0 
          },
        });

        logger.info('Nuevo comentario creado', { bookId: input.bookId });
        return newComment;
      } catch (error: any) {
        logger.error('Error en addComment', { error: error.message });
        throw new Error(error.message);
      }
    },
  }),

  createBook: defineAction({
    input: z.object({
      title: z.string().min(1),
      isbn: z.string().min(1),
      price: z.number().min(0),
      authorId: z.number().min(1),
      editorial: z.string().optional(),
      publicationYear: z.number().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),    
    }),
    handler: async (input) => {
      try {
        const authorExists = await prisma.author.findUnique({
            where: { id: input.authorId }
        });

        if (!authorExists) throw new Error("Autor no existe");

        const newBook = await prisma.book.create({
          data: {
            title: input.title,
            isbn: input.isbn,
            price: input.price,
            authorId: input.authorId,
            editorial: input.editorial || "General",
            publicationYear: input.publicationYear || 2024,
            description: input.description || null,
            imageUrl: input.imageUrl || null,
          },
        });
        
        const bookAny = newBook as any;
        logger.info('Libro creado', { title: input.title, isbn: input.isbn });
        
        return { ...bookAny, price: Number(bookAny.price) };
      } catch (error: any) {
        logger.error('Error creando libro', { error: error.message });
        if (error.code === 'P2002') throw new Error("ISBN duplicado.");
        throw new Error(error.message);
      }
    },
  }),

  updateBook: defineAction({
    input: z.object({
      id: z.number(), 
      title: z.string().min(1),
      isbn: z.string().min(1),
      price: z.number(),
      authorId: z.number().min(1),
      editorial: z.string().optional(),
      publicationYear: z.number().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
    }),
    handler: async (input) => {
      try {
        const updatedBook = await prisma.book.update({
          where: { id: input.id },
          data: {
            title: input.title,
            isbn: input.isbn,
            price: input.price,
            authorId: input.authorId,
            editorial: input.editorial,
            publicationYear: input.publicationYear,
            description: input.description,
            imageUrl: input.imageUrl,
          },
        });
        
        const bookAny = updatedBook as any;
        logger.info('Libro actualizado', { id: input.id });
        
        return { ...bookAny, price: Number(bookAny.price) };
      } catch (error: any) {
        logger.error('Error actualizando libro', { error: error.message });
        throw new Error("Error al actualizar libro.");
      }
    },
  }),
  
  deleteBook: defineAction({
    input: z.object({ id: z.number() }),
    handler: async (input) => {
      try {
        await prisma.comment.deleteMany({ where: { bookId: input.id } });
        await prisma.book.delete({ where: { id: input.id } });
        
        logger.info('Libro eliminado', { id: input.id });
        return { success: true };
      } catch (error: any) {
        logger.error('Error eliminando libro', { error: error.message });
        throw new Error("No se pudo eliminar.");
      }
    },
  }),
};