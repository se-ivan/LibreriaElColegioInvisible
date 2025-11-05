import { defineConfig } from "auth-astro";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";

import db from "./src/lib/prisma.ts";
import bcrypt from "bcryptjs";

export default defineConfig({
  adapter: PrismaAdapter(db),
  
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
    
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Correo Electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        console.log(credentials.email, credentials.password)
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        console.log(user);

        if (!user) {
          console.log("Usuario no encontrado con ese email.");
          return null;
        }

        if (!user.password) {
          console.log("El usuario no tiene un método de autenticación por contraseña.");
          return null;
        }

        const passwordIsValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        console.log(passwordIsValid)

        if (passwordIsValid) {
          return { 
              id: user.id, 
              name: user.name, 
              email: user.email, 
          };
        }
        
        console.log("Contraseña incorrecta.");
        return null;
      }
    })
  ],
  
  session: {
    strategy: "jwt", // Usando JWT porque Credentials provider requiere JWT
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  
  callbacks: {
    async jwt({ token, user }: any) {
      // Agregar información del usuario al token en el primer login
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Agregar información del token a la sesión
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
});