/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session: Promise<import("@auth/core/types").Session | null>;

    action?: {
        success: boolean;
        data?: unknown;
        error?: {
            message: string;
            code?: string;
            issues?: any[];
        };
    };
  }
}

// Extender el tipo Session para incluir el id del usuario
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
  }
}