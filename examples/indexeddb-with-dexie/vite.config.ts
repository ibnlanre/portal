import react from "@vitejs/plugin-react-swc";
import path from "path";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  plugins: [react(), tailwindcss()],
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
