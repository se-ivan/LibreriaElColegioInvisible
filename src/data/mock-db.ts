export interface Book {
  id: string; 
  title: string;
  authorId: string;
  genre: 'Fantasía' | 'Ciencia Ficción' | 'Misterio' | 'Realismo Mágico';
  coverImage: string;
  rating: number;
  votes: number;
}

export interface Author {
  id: string;
  name: string;
  nationality: string;
  birthDate: string | null;
  bio: string;
  imageUrl: string;
}

export interface Comment {
  id: string;
  bookId: string; 
  username: string;
  title: string;
  text: string;
  likes: number;
  timestamp: Date;
}

export interface Reply {
    commentId: string; 
    replyId: string;  
}


export let books: Book[] = [
  { id: '1', title: 'Cien años de soledad', authorId: '1', genre: 'Realismo Mágico', coverImage: '/img/book1.jpg', rating: 5, votes: 350 },
  { id: '2', title: 'El laberinto de la soledad', authorId: '2', genre: 'Misterio', coverImage: '/img/book2.jpg', rating: 5, votes: 210 },
];

export let authors: Author[] = [
  { id: '1', name: 'Gabriel García Márquez', nationality: 'Colombiana', birthDate: '1927-03-06', bio: 'Premio Nobel de Literatura en 1982.', imageUrl: '/img/gabo.jpg' },
  { id: '2', name: 'Octavio Paz', nationality: 'Mexicana', birthDate: '1914-03-31', bio: 'Poeta y ensayista, Premio Nobel en 1990.', imageUrl: '/img/paz.jpg' },
  { id: '3', name: 'Patrick Rothfuss', nationality: 'Estadounidense', birthDate: '1973-06-06', bio: 'Escritor estadounidense de fantasía.', imageUrl: '/img/author1.jpg' },
];

export let comments: Comment[] = [];

export let replies: Reply[] = [];