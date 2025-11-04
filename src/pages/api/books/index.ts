import type { APIRoute } from 'astro';
import { books, authors } from '../../../data/mock-db';

export const GET: APIRoute = ({ url }) => {
  const { searchParams } = url;
  const query = searchParams.get('q');
  const genre = searchParams.get('genero');
  
  let result = books;

  if (query) {
    const authorIds = authors.filter(a => a.name.toLowerCase().includes(query.toLowerCase())).map(a => a.id);
    result = result.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) || 
      authorIds.includes(book.authorId)
    );
  }

  if (genre) {
    result = result.filter(book => book.genre.toLowerCase() === genre.toLowerCase());
  }

  return new Response(JSON.stringify(result));
};