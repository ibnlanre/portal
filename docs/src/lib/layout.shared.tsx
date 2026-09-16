import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    links: [{ text: "Documentation", url: "/docs" }, { text: "Getting started", url: "/docs/getting-started" }],
    githubUrl: "https://github.com/ibnlanre/portal",
    nav: {
      title: <span className="portal-wordmark"><span className="portal-mark" aria-hidden="true" />portal<span className="portal-brand-label"> / docs</span></span>,
    },
  };
}
