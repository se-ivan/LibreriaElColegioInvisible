// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import Auth from "auth-astro";
import vercel from "@astrojs/react"

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [react(), markdoc(), keystatic(), Auth()],

  vite: {
    plugins: [tailwindcss()],
  },
});