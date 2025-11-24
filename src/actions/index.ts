import z from "zod";
import { defineAction } from "astro:actions";
import prisma from "../lib/prisma";
import { comment } from "./comments";
import { monthlyBook } from "./book-month";

export const server = {
    monthlyBook,
    comment,
}