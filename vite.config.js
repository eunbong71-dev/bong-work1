import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Exposes to the local network so mobile phones can connect
    port: 5173
  }
});
