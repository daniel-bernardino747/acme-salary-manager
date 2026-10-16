import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // In dev, Vite serves the app and forwards /api to `nest start --watch` (ADR 0003).
  server: { proxy: { '/api': 'http://localhost:3000' } },
  test: {
    // The web app's tests cover pure functions only, with no DOM (ADR 0006).
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
