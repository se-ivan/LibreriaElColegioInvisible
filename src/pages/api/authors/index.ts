import type { APIRoute } from 'astro';
import { authors } from '../../../data/mock-db';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(authors));
};