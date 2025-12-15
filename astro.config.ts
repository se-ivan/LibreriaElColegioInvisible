// @ts-check
import { defineConfig } from 'astro/config';

import markdoc from '@astrojs/markdoc';
import Auth from "auth-astro";
import vercel from '@astrojs/vercel/serverless'; 
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel({}),
  integrations: [react({ include: ['src/components/react/**'] }), markdoc(), Auth()],

  vite: {
    plugins: [tailwindcss()],
  },
});