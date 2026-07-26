// @ts-nocheck

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    mdx(await import("./source.config")),
    tailwindcss(),
    tsConfigPaths(),
    tanstackStart({
      prerender: {
        enabled: true,
      },
    }),
    react(),
  ],
  resolve: {
    conditions: ["node", "default"],
  },
  server: {
    port: 3000,
  },
  ssr: {
    external: ["react", "react-dom"],
    noExternal: ["fumadocs-mdx", "fumadocs-core", "fumadocs-ui"],
  },
});
