import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  deps: {
    neverBundle: ["react", "react-dom"],
  },
  dts: { generator: "tsc" },
  entry: ["index.ts"],
  format: ["esm", "cjs"],
  minify: true,
  outDir: "dist",
  platform: "browser",
  sourcemap: true,
  treeshake: true,
});
