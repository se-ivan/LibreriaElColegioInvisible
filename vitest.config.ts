import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default defineConfig(
  getViteConfig({
    test: {
      include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      setupFiles: ['./src/tests/test-setup.ts'],
      globals: true,
      environment: 'node',
    },
  })
);