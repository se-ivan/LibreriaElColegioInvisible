import { defineAction } from 'astro:actions';
import prisma from '../pages/lib/prisma';
import z from "zod";

export const votes = {
    updateVote: defineAction({
        accept: "json",
        input: z.object({
            bookId: z.number().int().positive(),
            voteValue: z.number().int().min(1).max(5),
        }),
        handler: async (data) => {
            const existingVote = await prisma.book.findFirst({
                where: {
                    id: data.bookId,
                },
            });
            if (existingVote) {
                const updatedVote = await prisma.book.update({
                    where: { id: existingVote.id },
                    data: { votes: data.voteValue + existingVote.votes },
                });
                return updatedVote;
            }},
    }),     
}