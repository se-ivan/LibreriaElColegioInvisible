declare module '@auth/core/types' {
  interface Session {
    user?: {
      id: string; 
      name?: string | null;
      email?: string | null;
      image?: string | null;

      isUser?: boolean;
    }
  }
  
  interface JWT {
    isUser?: boolean;
  }

  interface User {
    isUser?: boolean;
  }
}