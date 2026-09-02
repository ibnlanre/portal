import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ArrowRight, Boxes, Check, Code2, Layers, Zap } from "lucide-react";

import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/")({
  component: Home,
});

const features = [
  {
    description:
      "Four methods — $get, $set, $subscribe, $use. Learn once, use everywhere.",
    icon: Boxes,
    title: "Minimal API",
  },
  {
    description:
      "Deep object trees with dot-access. Update one field without touching the rest.",
    icon: Layers,
    title: "Nested State",
  },
  {
    description:
      "Full TypeScript inference from your initial value. No manual type annotations.",
    icon: Code2,
    title: "Type-Safe",
  },
  {
    description:
      "Hooks, context stores, subscriptions — everything works in React and React Native.",
    icon: Zap,
    title: "React Native",
  },
];

const steps = [
  {
    code: `import { createStore } from "@ibnlanre/portal";

const userStore = createStore({
  name: "Alex",
  theme: "dark",
});`,
    step: "1",
    title: "Define your store",
  },
  {
    code: `// Read
userStore.name.$get(); // "Alex"

// Write — objects merge automatically
userStore.$set({ theme: "light" });

// Subscribe to changes
userStore.$subscribe((state) => {
  console.log("Updated:", state);
});`,
    step: "2",
    title: "Read and write state",
  },
  {
    code: `function ThemeToggle() {
  const [theme, setTheme] = userStore.theme.$use();

  return (
    <button onClick={() =>
      setTheme(t => t === "dark" ? "light" : "dark")
    }>
      Current: {theme}
    </button>
  );
}`,
    step: "3",
    title: "Use in React",
  },
];

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-col">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_var(--fd-primary)/10%,transparent)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 -z-10 bg-fd-primary/5 blur-[120px] rounded-full" />

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium rounded-full border border-fd-border bg-fd-card/50 text-fd-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            v2.0 — Now with full React 19 support
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.1]">
            State management that{" "}
            <span className="text-fd-primary">gets out of your way</span>
          </h1>

          <p className="mt-5 text-lg text-fd-muted-foreground max-w-xl leading-relaxed">
            Portal is a type-safe state management library for React. Pass an
            initial value and get infinite nesting, automatic merging, and full
            TypeScript inference — for free.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              params={{ _splat: "" }}
              to="/docs/$"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-fd-border bg-fd-card font-medium text-sm hover:bg-fd-accent transition-colors"
              href="https://github.com/ibnlanre/portal"
              rel="noreferrer"
              target="_blank"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>

          {/* Quick code preview */}
          <div className="mt-14 w-full max-w-lg">
            <div className="rounded-xl border border-fd-border bg-fd-card shadow-lg overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-fd-border bg-fd-muted/50">
                <span className="w-3 h-3 rounded-full bg-fd-muted-foreground/20" />
                <span className="w-3 h-3 rounded-full bg-fd-muted-foreground/20" />
                <span className="w-3 h-3 rounded-full bg-fd-muted-foreground/20" />
                <span className="ml-2 text-xs text-fd-muted-foreground font-mono">
                  store.ts
                </span>
              </div>
              <pre className="p-4 text-sm font-mono text-fd-foreground overflow-x-auto leading-relaxed">
                <code>
                  <span className="text-fd-muted-foreground">
                    {"// Define your state"}
                  </span>
                  {"\n"}
                  <span className="text-fd-primary">const</span>
                  {" count = "}
                  <span className="text-fd-primary">createStore</span>
                  {"("}
                  <span className="text-orange-600 dark:text-orange-400">
                    0
                  </span>
                  {");"}
                  {"\n\n"}
                  <span className="text-fd-muted-foreground">
                    {"// Read, write, subscribe"}
                  </span>
                  {"\n"}
                  <span className="text-fd-primary">const</span>
                  {" [count, setCount] = count."}
                  <span className="text-fd-primary">$use</span>
                  {"();"}
                  {"\n"}
                  <span className="text-fd-primary">count</span>
                  {"."}
                  <span className="text-fd-primary">$set</span>
                  {"("}
                  <span className="text-orange-600 dark:text-orange-400">
                    5
                  </span>
                  {");"}
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20 border-t border-fd-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">
              Built for real applications
            </h2>
            <p className="mt-3 text-center text-fd-muted-foreground max-w-lg mx-auto">
              Everything you need to manage state — nothing you don't.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
              {features.map((f) => (
                <div
                  className="group p-6 rounded-xl border border-fd-border bg-fd-card hover:border-fd-primary/30 transition-colors"
                  key={f.title}
                >
                  <div className="w-10 h-10 rounded-lg bg-fd-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-fd-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm text-fd-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20 border-t border-fd-border bg-fd-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">
              Three steps to state
            </h2>
            <p className="mt-3 text-center text-fd-muted-foreground max-w-lg mx-auto">
              From store to working component in seconds.
            </p>
            <div className="mt-12 space-y-8">
              {steps.map((s) => (
                <div
                  className="rounded-xl border border-fd-border bg-fd-card overflow-hidden"
                  key={s.step}
                >
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-fd-border bg-fd-muted/30">
                    <span className="w-6 h-6 rounded-full bg-fd-primary text-fd-primary-foreground text-xs font-bold flex items-center justify-center">
                      {s.step}
                    </span>
                    <span className="font-medium text-sm">{s.title}</span>
                  </div>
                  <pre className="p-5 text-sm font-mono text-fd-foreground overflow-x-auto leading-relaxed">
                    <code>{s.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="px-6 py-20 border-t border-fd-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">
              Why Portal?
            </h2>
            <p className="mt-3 text-center text-fd-muted-foreground max-w-lg mx-auto">
              Compare with what you already know.
            </p>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-fd-border">
                    <th className="py-3 px-4 text-left font-medium text-fd-muted-foreground" />
                    <th className="py-3 px-4 text-left font-semibold text-fd-primary">
                      Portal
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-fd-muted-foreground">
                      Redux / Zustand
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Type inference",
                      "Full, automatic",
                      "Requires manual types",
                    ],
                    [
                      "Deep nesting",
                      "Automatic dot-access",
                      "Manual selectors",
                    ],
                    [
                      "Object merging",
                      "Deep merge by default",
                      "Shallow spread",
                    ],
                    ["Bundle size", "~2 KB", "~5-12 KB"],
                  ].map(([feature, portal, other]) => (
                    <tr className="border-b border-fd-border/50" key={feature}>
                      <td className="py-3 px-4 font-medium">{feature}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <Check className="w-4 h-4" />
                          {portal}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-fd-muted-foreground">
                        {other}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 border-t border-fd-border">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Ready to simplify your state?
            </h2>
            <p className="mt-3 text-fd-muted-foreground">
              Get started in under a minute.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-fd-border bg-fd-card font-mono text-sm">
              <span className="text-fd-muted-foreground">$</span>
              <span>pnpm add @ibnlanre/portal</span>
            </div>
            <div className="mt-6">
              <Link
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                params={{ _splat: "" }}
                to="/docs/$"
              >
                Read the Documentation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-fd-border text-center text-sm text-fd-muted-foreground">
          <p>
            Built by{" "}
            <a
              className="underline underline-offset-2 hover:text-fd-foreground transition-colors"
              href="https://github.com/ibnlanre"
              rel="noreferrer"
              target="_blank"
            >
              ibnlanre
            </a>
            . Released under BSD-3-Clause.
          </p>
        </footer>
      </main>
    </HomeLayout>
  );
}
