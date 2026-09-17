import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    links: [],
    githubUrl: "https://github.com/ibnlanre/portal",
    nav: {
      title: <span className="portal-wordmark"><span className="portal-mark" aria-hidden="true" />portal<span className="portal-brand-label"> / docs</span></span>,
    },
  };
}
