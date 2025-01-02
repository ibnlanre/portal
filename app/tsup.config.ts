import { defineConfig, type Options } from "tsup";

const cjs = {
  outDir: "dist/cjs",
  entry: ["index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  legacyOutput: true,
} satisfies Options;

const esm = {
  outDir: "dist/esm",
  entry: ["index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  target: "es6",
} satisfies Options;

export default defineConfig([cjs, esm]);
