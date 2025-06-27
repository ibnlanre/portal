import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  plugins: [tsconfigPaths(), react(), tailwindcss()],
  server: {
    open: true,
    port: 3000,
  },
});
