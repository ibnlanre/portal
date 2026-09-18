import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const [packed] = JSON.parse(
  execFileSync("npm", ["pack", "--dry-run", "--ignore-scripts", "--json"], {
    cwd: new URL("../", import.meta.url),
    encoding: "utf8",
  })
);

const directory = new URL("../dist/", import.meta.url);
const source = readFileSync(new URL("index.js", directory));
function bytes(path) {
  return readdirSync(path).reduce((sum, file) => {
    const entry = join(path, file);
    return (
      sum +
      (statSync(entry).isDirectory() ? bytes(entry) : statSync(entry).size)
    );
  }, 0);
}
console.log(
  JSON.stringify(
    {
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
      packageTarballBytes: packed.size,
      packageUnpackedBytes: packed.unpackedSize,
      builtDistributionBytes: bytes(directory.pathname),
      fullEsmBytes: source.length,
      fullEsmGzipBytes: gzipSync(source).length,
      fullEsmBrotliBytes: brotliCompressSync(source).length,
      note: "Full entry, not a tree-shaken consumer bundle. Distribution includes CJS, declarations and source maps.",
    },
    null,
    2
  )
);
