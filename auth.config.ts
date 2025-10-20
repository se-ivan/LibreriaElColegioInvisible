import { defineConfig } from 'auth-astro';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import bcrypt from 'bcryptjs';
import { z, ZodError } from 'zod';

const prisma = new PrismaClient();

export default defineConfig({
  // Secret y adaptador
  secret: import.meta.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  // Proveedores de autenticación
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        // Ejemplo de validación de credenciales
        try {
          const { email, password } = await z.object({
            email: z.string().email(),
            password: z.string().min(6),
          }).parseAsync(credentials);
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) throw new Error("Usuario no existe");
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) throw new Error("Contraseña incorrecta");
          return user;
        } catch {
          throw new Error("Credenciales inválidas");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
});
