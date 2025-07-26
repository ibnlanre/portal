import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: { resolve: true },
  entry: ["index.ts"],
  external: ["react", "react-dom"],
  format: ["esm", "cjs"],
  minify: true,
  minifyWhitespace: true,
  outDir: "dist",
  platform: "browser",
  sourcemap: true,
});
