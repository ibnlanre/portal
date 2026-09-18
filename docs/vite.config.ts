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
        // In-page anchors are not pages. The crawler treats
        // "/docs/core/reading-state#section" as its own route, which
        // prerenders the parent document twice. The fragment adds nothing
        // to a static file, so skip any crawled path carrying one.
        filter: ({ path }) => !path.includes("#"),
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      tslib: "tslib/tslib.es6.js",
    },
  },
  server: {
    port: 3000,
  },
  ssr: {
    external: ["react", "react-dom"],
    noExternal: ["fumadocs-mdx", "fumadocs-core", "fumadocs-ui"],
  },
});
