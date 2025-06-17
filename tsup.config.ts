import { defineConfig, type Options } from "tsup";

const cjs = {
  clean: true,
  dts: true,
  entry: ["index.ts"],
  legacyOutput: true,
  outDir: "dist/cjs",
  sourcemap: true,
  splitting: false,
} satisfies Options;

const esm = {
  clean: true,
  dts: true,
  entry: ["index.ts"],
  outDir: "dist/esm",
  sourcemap: true,
  splitting: false,
  target: "es6",
} satisfies Options;

export default defineConfig([cjs, esm]);
