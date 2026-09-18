import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ArrowRight, Braces, GitBranch, Layers } from "lucide-react";
import { useState } from "react";

import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/")({
  component: Home,
});

type Theme = "dark" | "light";

const principles = [
  {
    detail:
      "Start at the root, then work at the exact branch your feature owns.",
    example: 'app.$at("user.profile.preferences")',
    icon: GitBranch,
    label: "Focus a branch",
  },
  {
    detail: "Every nested value exposes the same familiar store methods.",
    example: 'preferences.theme.$set("light")',
    icon: Braces,
    label: "Use one store model",
  },
  {
    detail:
      "Update an object branch without rebuilding unrelated state by hand.",
    example: 'preferences.$set({ theme: "light" })',
    icon: Layers,
    label: "Update with context",
  },
];

const modelRows = [
  {
    detail: "Read a value at a known nested path.",
    method: "app.user.profile.name.$get()",
    task: "Read deeply nested state",
  },
  {
    detail: "Create a store scoped to the branch a feature needs.",
    method: 'app.$at("user.profile.preferences")',
    task: "Focus a nested branch",
  },
  {
    detail: "Update a leaf or merge an object branch directly.",
    method: 'preferences.theme.$set("light")',
    task: "Write without plumbing",
  },
  {
    detail: "Use the focused store in React with the same API.",
    method: "preferences.theme.$use()",
    task: "React to one branch",
  },
];

function Home() {
  const [theme, setTheme] = useState<Theme>("dark");
  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  return (
    <HomeLayout {...baseOptions()}>
      <main className="portal-page">
        <section aria-labelledby="portal-title" className="portal-hero">
          <div className="portal-hero-copy">
            <p className="portal-eyebrow">A little structure. Room to grow.</p>
            <h1 id="portal-title">State, naturally.</h1>
            <p className="portal-lede">
              A thoughtful home for your React state. Start with a root, follow
              a branch, and find the same simple API wherever your application
              grows.
            </p>
            <div className="portal-actions">
              <Link
                className="portal-button portal-button-primary"
                params={{ _splat: "" }}
                to="/docs/$"
              >
                Start growing <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <a
                className="portal-button portal-button-secondary"
                href="https://github.com/ibnlanre/portal"
                rel="noreferrer"
                target="_blank"
              >
                Explore the source
              </a>
            </div>
            <p aria-label="Install Portal with pnpm" className="portal-install">
              <span aria-hidden="true">$</span> pnpm add @ibnlanre/portal
            </p>
          </div>

          <figure className="portal-art">
            <img
              alt="Sunlight falling through a jade-green courtyard filled with white orchids and leafy branches"
              fetchPriority="high"
              src="/images/courtyard.jpg"
            />
            <figcaption>
              <span>Rooted in simplicity.</span>
              <span>Built to branch out.</span>
            </figcaption>
          </figure>
        </section>

        <div className="portal-specimen-strip">
          <span>Made for React</span>
          <span>TypeScript, from root to leaf</span>
          <span>One API. Every branch.</span>
        </div>

        <section
          aria-labelledby="demo-title"
          className="portal-demo portal-section"
        >
          <div className="portal-section-intro">
            <p className="portal-eyebrow">01 / A living example</p>
            <h2 id="demo-title">
              Small changes.
              <br />
              Deep roots.
            </h2>
            <p>
              Your state has a shape. Work with it. Reach into any branch and
              read, update, or subscribe with the same familiar methods.
            </p>
            <Link
              className="portal-text-link"
              params={{ _splat: "getting-started" }}
              to="/docs/$"
            >
              Meet your first store <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>

          <div
            aria-label="Interactive nested-state example"
            className="portal-playground"
          >
            <div className="portal-playground-heading">
              <div>
                <p className="portal-kicker">Interactive model</p>
                <p>Follow the branch, then update it.</p>
              </div>
              <span className="portal-status">{theme} theme</span>
            </div>

            <div aria-label="Portal code example" className="portal-code">
              <pre>
                <code>
                  <span className="portal-code-keyword">const</span> app =
                  createStore({"{"}
                  {"\n"}
                  {"  "}user: {"{"}
                  {"\n"}
                  {"    "}profile: {"{"}
                  {"\n"}
                  {"      "}preferences: {"{ theme: "}
                  <span className="portal-code-value">&quot;{theme}&quot;</span>
                  {" },"}
                  {"\n"}
                  {"    },"}
                  {"\n"}
                  {"  },"}
                  {"\n"}
                  {"});"}
                  {"\n\n"}
                  <span className="portal-code-keyword">const</span> preferences
                  = app.
                  <span className="portal-code-method">$at</span>({"\n"}
                  {"  "}
                  <span className="portal-code-value">
                    &quot;user.profile.preferences&quot;
                  </span>
                  {"\n"}
                  );{"\n\n"}
                  preferences.theme.
                  <span className="portal-code-method">$set</span>(
                  <span className="portal-code-value">
                    &quot;{nextTheme}&quot;
                  </span>
                  );
                </code>
              </pre>
            </div>

            <div
              aria-label={`State tree with theme set to ${theme}`}
              className="portal-tree"
            >
              <p className="portal-tree-label">app</p>
              <div className="portal-tree-branch">
                <p>user</p>
                <div className="portal-tree-branch">
                  <p>profile</p>
                  <div className="portal-tree-branch portal-tree-active">
                    <p>preferences</p>
                    <div className="portal-tree-leaf">
                      <span>theme</span>
                      <strong>{theme}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="portal-run"
              onClick={() => setTheme(nextTheme)}
              type="button"
            >
              Set theme to {nextTheme}
              <ArrowRight aria-hidden="true" size={16} />
            </button>
            <p aria-live="polite" className="portal-sr-only">
              Theme is {theme}.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="principles-title"
          className="portal-section portal-principles"
        >
          <div className="portal-section-intro">
            <p className="portal-eyebrow">02 / The essentials</p>
            <h2 id="principles-title">
              Deep state should not create a second API.
            </h2>
          </div>
          <div className="portal-principle-list">
            {principles.map(({ detail, example, icon: Icon, label }, index) => (
              <article className="portal-principle" key={label}>
                <span className="portal-principle-number">0{index + 1}</span>
                <Icon aria-hidden="true" size={19} strokeWidth={1.7} />
                <div>
                  <h3>{label}</h3>
                  <p>{detail}</p>
                  <code>{example}</code>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="model-title"
          className="portal-section portal-model"
        >
          <div className="portal-section-intro">
            <p className="portal-eyebrow">03 / A field guide</p>
            <h2 id="model-title">
              Work at the level your feature understands.
            </h2>
            <p>
              A few familiar methods, wherever you are in the tree. Read a leaf,
              update a branch, or let your component grow with the state.
            </p>
          </div>
          <dl className="portal-model-list">
            {modelRows.map(({ detail, method, task }) => (
              <div className="portal-model-row" key={task}>
                <dt>{task}</dt>
                <dd>
                  <code>{method}</code>
                  <span>{detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="cta-title" className="portal-cta">
          <p className="portal-eyebrow">Make yourself at home</p>
          <h2 id="cta-title">Good things grow from simple roots.</h2>
          <p>
            See the API, nested-state examples, and React integration in the
            documentation.
          </p>
          <Link
            className="portal-button portal-button-primary"
            params={{ _splat: "" }}
            to="/docs/$"
          >
            Explore Portal <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </section>

        <footer className="portal-footer">
          <p>
            Built by{" "}
            <a
              href="https://github.com/ibnlanre"
              rel="noreferrer"
              target="_blank"
            >
              ibnlanre
            </a>{" "}
            · BSD-3-Clause
          </p>
        </footer>
      </main>
    </HomeLayout>
  );
}
