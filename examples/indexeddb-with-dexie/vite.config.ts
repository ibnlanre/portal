import path from "path";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../.."),
    },
  },
  server: {
    open: true,
    port: 3000,
  },
});
