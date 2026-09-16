import type { Root } from "fumadocs-core/page-tree";

export const docsTree: Root = {
  name: "Portal documentation",
  children: [
    { type: "page", name: "Getting Started", url: "/docs/getting-started" },
    { type: "page", name: "Introduction", url: "/docs" },
    {
      type: "folder",
      name: "Core",
      defaultOpen: true,
      children: [
        { type: "page", name: "Store API", url: "/docs/core/store-api" },
        { type: "page", name: "Reading State", url: "/docs/core/reading-state" },
        { type: "page", name: "Setting State", url: "/docs/core/setting-state" },
        { type: "page", name: "Subscriptions", url: "/docs/core/subscriptions" },
      ],
    },
    {
      type: "folder",
      name: "Advanced",
      defaultOpen: true,
      children: [
        { type: "page", name: "Actions & Logic", url: "/docs/advanced/actions" },
        { type: "page", name: "Organizing with combine()", url: "/docs/advanced/combine" },
        { type: "page", name: "Scoped Stores (Context)", url: "/docs/advanced/context-store" },
        { type: "page", name: "Helpful Hooks", url: "/docs/advanced/hooks" },
        { type: "page", name: "React Integration", url: "/docs/advanced/react-integration" },
      ],
    },
    {
      type: "folder",
      name: "Guides",
      defaultOpen: true,
      children: [
        { type: "page", name: "Persistence", url: "/docs/guides/persistence" },
        { type: "page", name: "Cookie Utilities", url: "/docs/guides/cookie-storage" },
      ],
    },
    { type: "page", name: "FAQ", url: "/docs/faq" },
  ],
};
