import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import prisma from '../lib/prisma';

export const server = {
  
  // 1. OBTENER LISTA DE AUTORES (Para el select del modal)
  getAuthors: defineAction({
    handler: async () => {
      try {
        // Obtenemos autores ordenados alfabéticamente
        const authors = await prisma.author.findMany({
          orderBy: { name: 'asc' },
          // Seleccionamos solo lo necesario para el dropdown
          select: { id: true, name: true, lastName: true }
        });
        return authors;
      } catch (e: any) {
        console.error("Error getAuthors:", e);
        throw new Error("Error al cargar la lista de autores");
      }
    }
  }),

  // 2. OBTENER CATÁLOGO DE LIBROS (Paginado y con búsqueda)
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

        // 🔥 FIX: (booksRaw as any[])
        // Usamos 'any' para evitar errores si TS cree que 'imageUrl' no existe
        const books = (booksRaw as any[]).map(book => ({
            ...book,
            price: Number(book.price), // Convertimos Decimal a Number
            coverImage: book.imageUrl || null // Mapeamos imageUrl a coverImage
        }));

        return {
          books,
          total,
          totalPages: Math.ceil(total / input.pageSize),
          currentPage: input.page
        };
      } catch (e) {
        console.error("Error getBooks:", e);
        throw new Error("Error al obtener el catálogo");
      }
    },
  }),

  // 3. OBTENER DETALLE DE UN LIBRO
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
        
        // 🔥 FIX: 'bookRaw as any' para leer description e imageUrl libremente
        const bookAny = bookRaw as any;

        const book = { 
            ...bookAny, 
            price: Number(bookAny.price), 
            coverImage: bookAny.imageUrl || null, 
            description: bookAny.description || null
        };
        
        // Mapeamos también los relacionados
        const relatedBooks = (relatedRaw as any[]).map(b => ({ 
            ...b, 
            price: Number(b.price), 
            coverImage: b.imageUrl || null 
        }));

        return { book, relatedBooks };
      } catch (error) {
        console.error("Error getBook:", error);
        throw new Error("No se pudo cargar el detalle del libro");
      }
    },
  }),

  // 4. AGREGAR COMENTARIO (Sin Rating, con Title y Description)
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
            where: { bookId: input.bookId, userId: input.userId } 
        });

        if (existing) {
            throw new Error("Ya has publicado una reseña para este libro.");
        }
        
        // 🔥 FIX: 'dataToSave: any' para saltarnos validación estricta de TS
        const dataToSave: any = {
            title: input.title,             
            description: input.description, 
            bookId: input.bookId, 
            userId: input.userId, 
            like: 0 
        };

        const newComment = await prisma.comment.create({ data: dataToSave });
        return newComment;

      } catch (error: any) {
        console.error("Error addComment:", error);
        throw new Error(error.message || "Error al guardar comentario");
      }
    },
  }),

  // 5. CREAR LIBRO (Admin) - Sin Genre, con imageUrl y description
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
        const authorExists = await prisma.author.findUnique({ where: { id: input.authorId } });
        if (!authorExists) throw new Error("Autor no existe");

        // 🔥 FIX: 'dataToCreate: any'
        const dataToCreate: any = {
            title: input.title,
            isbn: input.isbn,
            price: input.price,
            authorId: input.authorId,
            editorial: input.editorial || "General",
            publicationYear: input.publicationYear || new Date().getFullYear(),
            description: input.description || null,
            imageUrl: input.imageUrl || null,
        };

        const newBook = await prisma.book.create({ data: dataToCreate });
        
        const bookAny = newBook as any;
        // Devolvemos el precio como número para que el frontend no falle
        return { ...bookAny, price: Number(bookAny.price) };

      } catch (error: any) {
        console.error("Error createBook:", error);
        if (error.code === 'P2002') throw new Error("El ISBN ya existe.");
        throw new Error(error.message || "Error al crear libro");
      }
    },
  }),

  // 6. ACTUALIZAR LIBRO (Admin)
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
        // 🔥 FIX: 'dataToUpdate: any'
        const dataToUpdate: any = {
            title: input.title, 
            isbn: input.isbn, 
            price: input.price, 
            authorId: input.authorId,
            editorial: input.editorial, 
            publicationYear: input.publicationYear,
            description: input.description, 
            imageUrl: input.imageUrl,
        };

        const updatedBook = await prisma.book.update({
          where: { id: input.id },
          data: dataToUpdate,
        });
        
        const bookAny = updatedBook as any;
        return { ...bookAny, price: Number(bookAny.price) };
      } catch (error) {
        console.error("Error updateBook:", error);
        throw new Error("Error al actualizar libro.");
      }
    },
  }),
  
  // 7. ELIMINAR LIBRO (Admin)
  deleteBook: defineAction({
    input: z.object({ id: z.number() }),
    handler: async (input) => {
      try {
        // Borrado en cascada manual (primero comentarios, luego libro)
        await prisma.comment.deleteMany({ where: { bookId: input.id } });
        await prisma.book.delete({ where: { id: input.id } });
        return { success: true };
      } catch (error) { 
        console.error("Error deleteBook:", error);
        throw new Error("No se pudo eliminar el libro."); 
      }
    },
  }),
};