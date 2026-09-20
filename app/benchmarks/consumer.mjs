/**
 * Measures a real tree-shaken consumer bundle for the built ESM entry.
 * React stays external, as it would in a React application build.
 *
 * Run from the app directory: pnpm bench:bundle
 */
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { brotliCompressSync, gzipSync } from "node:zlib";

const app = new URL("../", import.meta.url).pathname;
const directory = mkdtempSync(join(tmpdir(), "portal-consumer-"));

// Lay out the package the way it ships: dist plus package metadata, resolved
// through node_modules so exports and sideEffects participate in bundling.
const installed = join(directory, "node_modules", "@ibnlanre", "portal");
cpSync(join(app, "dist"), join(installed, "dist"), { recursive: true });
cpSync(join(app, "package.json"), join(installed, "package.json"));

const entries = {
  full: `export * from "@ibnlanre/portal";\n`,
  minimal: `import { createStore } from "@ibnlanre/portal";\nexport const store = createStore({ count: 0 });\n`,
};

const results = {};
for (const [name, code] of Object.entries(entries)) {
  const input = join(directory, `${name}.js`);
  const output = join(directory, `${name}.bundle.js`);
  writeFileSync(input, code);
  execFileSync(
    "pnpm",
    [
      "exec",
      "esbuild",
      input,
      "--bundle",
      "--minify",
      "--format=esm",
      "--target=es2020",
      "--external:react",
      "--external:react-dom",
      "--external:react/jsx-runtime",
      `--outfile=${output}`,
    ],
    { cwd: app, stdio: "pipe" }
  );
  const bundle = readFileSync(output);
  results[name] = {
    brotliBytes: brotliCompressSync(bundle).length,
    gzipBytes: gzipSync(bundle).length,
    minifiedBytes: bundle.length,
  };
}

rmSync(directory, { force: true, recursive: true });

console.log(
  JSON.stringify(
    {
      note: "Minified consumer bundles of the built ESM entry via esbuild; React external. The minimal entry imports createStore only.",
      react: "external",
      ...results,
    },
    null,
    2
  )
);
