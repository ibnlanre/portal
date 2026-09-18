import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { Suspense } from "react";

import { docsTree } from "@/lib/docs-tree";
import { baseOptions } from "@/lib/layout.shared";

import defaultMdxComponents from "fumadocs-ui/mdx";

import browserCollections from "@/.source/browser";

const pageEntries = new Set(
  Object.keys(browserCollections.docs.raw).map((path) =>
    path.startsWith("./") ? path.slice(2) : path
  )
);

/**
 * Resolves a docs slug to its collection entry path.
 *
 * The docs site is exported statically, so this must be derivable on the client
 * rather than resolved through a server function. Entry paths are relative to
 * the content directory, without the leading `./` the glob keys carry.
 */
function resolvePagePath(slugs: string[]) {
  const slug = slugs.join("/");
  const candidates = slug
    ? [`${slug}.mdx`, `${slug}.md`, `${slug}/index.mdx`, `${slug}/index.md`]
    : ["index.mdx", "index.md"];

  return candidates.find((candidate) => pageEntries.has(candidate));
}

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = (params._splat ?? "").split("/").filter(Boolean);
    const path = resolvePagePath(slugs);

    if (!path) throw notFound();

    await clientLoader.preload(path);
    return { path };
  },
});

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { default: MDX, frontmatter, toc },
    props: {
      className?: string;
    }
  ) {
    return (
      <DocsPage toc={toc} {...props}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = Route.useLoaderData();

  return (
    <DocsLayout {...baseOptions()} tree={docsTree}>
      <Suspense>
        {clientLoader.useContent(data.path, {
          className: "portal-docs",
        })}
      </Suspense>
    </DocsLayout>
  );
}
