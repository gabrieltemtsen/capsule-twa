import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const SEREVER_URL = process.env.VITE_SERVER_URL;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        process: true,
        global: true,
        Buffer: true,
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target:   SEREVER_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
