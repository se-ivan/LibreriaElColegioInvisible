import prisma from '../lib/prisma';
import { defineAction } from 'astro:actions';
import z from "zod";

export const server = {
  addComment: defineAction({
    accept: "json",
    input: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        book_id: z.number().int().positive(),
        userId: z.string().min(1),
    }),
    handler: async (data) => {
      const newComment = await prisma.comment.create({
        data: {
          title: data.title,
          description: data.description,
          bookId: data.book_id,
          userId: data.userId,
        },
      });
      return newComment;
    }
  }),

  getCommentsByBook: defineAction({
    accept: "json",

    input: z.object({
        book_id: z.number().int().positive(),
    }),
    handler: async(data) => {
      const comments = await prisma.comment.findMany({
        where: {
          bookId: data.book_id,
        },
      });
      return comments;
    }
  }),

  deleteCommentByUser: defineAction({
    accept: "json",
    input: z.object({
        comment_id: z.number().int().positive(),
        userId: z.string().min(1),
    }),
    handler: async(data) => {
      const deletedComment = await prisma.comment.deleteMany({
        where: {
          id: data.comment_id,
          userId: data.userId
        }
      });  
      
      const deleteReplies = await prisma.reply.deleteMany({
        where: {
          commentId: data.comment_id
        }
      })
      return {deletedComment, deleteReplies};
    }

  })
}
