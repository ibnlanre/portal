import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: "https://github.com/ibnlanre/portal",
    links: [],
    nav: {
      title: (
        <span className="portal-wordmark">
          <span aria-hidden="true" className="portal-mark" />
          portal<span className="portal-brand-label"> / docs</span>
        </span>
      ),
    },
  };
}
