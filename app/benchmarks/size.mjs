import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { brotliCompressSync, gzipSync } from "node:zlib";

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
      architecture: process.arch,
      builtDistributionBytes: bytes(directory.pathname),
      fullEsmBrotliBytes: brotliCompressSync(source).length,
      fullEsmBytes: source.length,
      fullEsmGzipBytes: gzipSync(source).length,
      node: process.version,
      note: "Full entry, not a tree-shaken consumer bundle. Distribution includes CJS, declarations and source maps.",
      packageTarballBytes: packed.size,
      packageUnpackedBytes: packed.unpackedSize,
      platform: process.platform,
    },
    null,
    2
  )
);
