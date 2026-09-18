import type { Root } from "fumadocs-core/page-tree";

export const docsTree: Root = {
  children: [
    { name: "Getting Started", type: "page", url: "/docs/getting-started" },
    { name: "Introduction", type: "page", url: "/docs" },
    {
      children: [
        { name: "Store API", type: "page", url: "/docs/core/store-api" },
        {
          name: "Reading State",
          type: "page",
          url: "/docs/core/reading-state",
        },
        {
          name: "Setting State",
          type: "page",
          url: "/docs/core/setting-state",
        },
        {
          name: "Subscriptions",
          type: "page",
          url: "/docs/core/subscriptions",
        },
      ],
      defaultOpen: true,
      name: "Core",
      type: "folder",
    },
    {
      children: [
        {
          name: "Actions & Logic",
          type: "page",
          url: "/docs/advanced/actions",
        },
        {
          name: "Organizing with combine()",
          type: "page",
          url: "/docs/advanced/combine",
        },
        {
          name: "Scoped Stores (Context)",
          type: "page",
          url: "/docs/advanced/context-store",
        },
        { name: "Helpful Hooks", type: "page", url: "/docs/advanced/hooks" },
        {
          name: "React Integration",
          type: "page",
          url: "/docs/advanced/react-integration",
        },
      ],
      defaultOpen: true,
      name: "Advanced",
      type: "folder",
    },
    {
      children: [
        { name: "Persistence", type: "page", url: "/docs/guides/persistence" },
        {
          name: "Cookie Utilities",
          type: "page",
          url: "/docs/guides/cookie-storage",
        },
      ],
      defaultOpen: true,
      name: "Guides",
      type: "folder",
    },
    { name: "FAQ", type: "page", url: "/docs/faq" },
  ],
  name: "Portal documentation",
};
