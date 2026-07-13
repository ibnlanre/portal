import { Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";

export function NotFound() {
  return (
    <HomeLayout
      className="text-center py-32 justify-center"
      nav={{
        title: "Portal",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-7xl font-bold text-fd-muted-foreground/30">404</h1>
        <h2 className="text-2xl font-semibold -mt-2">Page Not Found</h2>
        <p className="text-fd-muted-foreground max-w-md leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          className="mt-4 px-5 py-2.5 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          to="/"
        >
          Back to Home
        </Link>
      </div>
    </HomeLayout>
  );
}
