import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["index.ts"],
  format: ["esm", "cjs"],
  minify: true,
  outDir: "dist",
  platform: "browser",
  sourcemap: true,
  treeshake: true,
  deps: {
    neverBundle: ["react", "react-dom"],
  },
});
