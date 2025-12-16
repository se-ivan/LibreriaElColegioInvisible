/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    setupFiles: ['./src/tests/test-setup.ts'],
    globals: true,
    environment: 'node',
  },
});