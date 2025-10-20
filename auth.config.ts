// src/auth.config.ts
import { defineConfig } from "auth-astro";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";

// Importaciones para la lógica real
import  db  from "./src/lib/prisma.ts" // Ajusta la ruta a donde tengas tu cliente de Prisma
import bcrypt from "bcryptjs";

export default defineConfig({
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
        // Valida que las credenciales existan
        console.log(credentials.email, credentials.password)
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Busca el usuario en la base de datos por su correo electrónico
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        console.log(user);
        // 2. Si el usuario no existe, la autenticación falla
        if (!user) {
          console.log("Usuario no encontrado con ese email.");
          return null;
        }

        // 3. Si el usuario existe pero no tiene contraseña (ej: se registró con Google)
        if (!user.password) {
          console.log("El usuario no tiene un método de autenticación por contraseña.");
          return null;
        }

        // 4. Compara de forma segura la contraseña proporcionada con el hash de la BD
        const passwordIsValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        console.log(passwordIsValid)

        // 5. Si la contraseña es válida, retorna el usuario
        if (passwordIsValid) {
          // No incluyas el hash de la contraseña en el objeto que retornas
          return { 
              id: user.id, 
              name: user.name, 
              email: user.email, 
              // puedes añadir más datos como el rol, etc.
          };
        }
        
        // 6. Si la contraseña no es válida, la autenticación falla
        console.log("Contraseña incorrecta.");
        return null;
      }
    })
  ],
});