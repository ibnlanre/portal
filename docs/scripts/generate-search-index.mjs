import { createSearchAPI } from "fumadocs-core/search/server";
// Generates the static search index consumed by `fumadocs-ui`'s search dialog
// (`type: "static"`). The docs site is exported statically, so the index must be
// produced at build time instead of served from an API route.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content", "docs");
const outputFile = join(root, "public", "search-index.json");

function collectPages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) return collectPages(path);
    return /\.mdx?$/.test(entry.name) ? [path] : [];
  });
}

function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  const frontmatter = match?.[1] ?? "";
  const body = match ? source.slice(match[0].length) : source;
  const read = (key) =>
    new RegExp(`^${key}:\\s*(.+)$`, "m")
      .exec(frontmatter)?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, "");

  return { body, description: read("description"), title: read("title") };
}

function slugify(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\da-z\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^import\s.*$/gm, " ")
    .replace(/^export\s.*$/gm, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, " ")
    .replace(/[*_>~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Splits a page into heading/content blocks.
 *
 * Fumadocs' static search client handles `advanced` indexes correctly, while
 * its `simple` index path passes the wrong object to Orama (fumadocs-core
 * 16.11.3), so the export is generated with structured data.
 */
function toStructuredData(markdown) {
  const headings = [];
  const contents = [];
  let current;
  let buffer = [];

  function flush() {
    const content = stripMarkdown(buffer.join("\n"));
    if (content) contents.push({ content, heading: current });
    buffer = [];
  }

  for (const line of markdown.split(/\r?\n/)) {
    const match = /^(#{1,6})\s+(.*)$/.exec(line);

    if (match) {
      flush();
      current = match[2].trim();
      headings.push({ content: current, id: slugify(current) });
    } else {
      buffer.push(line);
    }
  }

  flush();

  return { contents, headings };
}

function toUrl(file) {
  const slug = relative(contentDir, file)
    .replace(/\\/g, "/")
    .replace(/\.mdx?$/, "");
  const path = slug.endsWith("/index") ? slug.slice(0, -"/index".length) : slug;

  return path ? `/docs/${path}` : "/docs";
}

const indexes = collectPages(contentDir).map((file) => {
  const source = readFileSync(file, "utf8");
  const { body, description, title } = parseFrontmatter(source);
  const url = toUrl(file);

  return {
    description,
    id: url,
    structuredData: toStructuredData(body),
    title: title ?? url,
    url,
  };
});

const response = await createSearchAPI("advanced", { indexes }).staticGET();

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(outputFile, await response.text());

console.log(
  `[search] wrote ${indexes.length} pages to public/search-index.json`
);
