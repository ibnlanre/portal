import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  external: ["react", "react-dom"],
  dts: { resolve: true },
  format: ["esm", "cjs"],
  entry: ["index.ts"],
  outDir: "dist",
  sourcemap: true,
  splitting: false,
  target: "es2015",
  platform: "browser",
});
