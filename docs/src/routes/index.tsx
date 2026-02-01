import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";

import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-col items-center justify-center flex-1 gap-3 px-4">
        <h1 className="text-4xl font-bold">Portal Documentation</h1>
        <p className="text-fd-muted-foreground text-lg max-w-md">
          A powerful state management library for React
        </p>
        <Link
          className="px-6 py-3 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-base hover:opacity-90 transition-opacity"
          params={{
            _splat: "",
          }}
          to="/docs/$"
        >
          Open Docs
        </Link>
      </div>
    </HomeLayout>
  );
}
