// src/pages/api/register.ts
import type { APIRoute } from "astro";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";


export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name = data.get("name") as string;
  const lastName = data.get("lastName") as string;
  const email = data.get("email") as string;
  const password = data.get("password") as string;

  if (!name || !lastName || !email || !password) {
    return new Response("Faltan campos requeridos", { status: 400 });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    return new Response("El correo ya está registrado", { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      lastName,
      email,
      password: hashedPassword,
    },
  });

  return new Response("Usuario creado exitosamente", { status: 201 });
};