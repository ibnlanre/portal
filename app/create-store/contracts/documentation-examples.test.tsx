import { act, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { batch } from "@/create-store/functions/helpers/batch";
import { fakeBroadcastChannel } from "@/create-store/functions/helpers/channel/fake-broadcast-channel";

import { asyncAdapter } from "../functions/adapters/async-adapter";
import { localAdapter } from "../functions/adapters/local-adapter";
import { collection } from "../functions/library/collection";
import { composite } from "../functions/library/composite";
import { contextStore } from "../functions/library/context-store";
import { primitive } from "../functions/library/primitive";
import { persist } from "../functions/utilities/persist";

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("the introduction and getting-started examples", () => {
  type Line = string;
  const make = () => {
    const app = composite({
      cart: composite({ items: primitive<Line[]>([]) }),
      picked: primitive<null | string>(null),
      theme: primitive<"dark" | "light">("light"),
      title: "",
      toggle() {
        app.theme.$set((theme) => (theme === "light" ? "dark" : "light"));
      },
      user: composite({ name: "Taylor" }),
    });
    return app;
  };

  it("reads, writes a branch, and toggles through a method", () => {
    const app = make();
    app.user.name.$set("Jordan");
    expect(app.$get()).toEqual({
      cart: { items: [] },
      picked: null,
      theme: "light",
      title: "",
      user: { name: "Jordan" },
    });
    app.toggle();
    expect(app.theme.$get()).toBe("dark");
  });

  it("creates collection entries on first use", () => {
    const drafts = collection((id: string) =>
      composite({ lines: primitive<string[]>([]), organisation: id })
    );
    drafts("acme").lines.$set(["a"]);
    expect(drafts.$has("acme")).toBe(true);
    drafts.$delete("acme");
    expect(drafts.$has("acme")).toBe(false);
  });

  it("renders a branch in a component", () => {
    const app = make();
    function Title() {
      const [title, setTitle] = app.title.$use();
      return (
        <input
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
      );
    }
    const view = render(<Title />);
    expect(view.container.querySelector("input")).toBeTruthy();
    act(() => app.title.$set("hello"));
    expect(
      (view.container.querySelector("input") as HTMLInputElement).value
    ).toBe("hello");
  });
});

describe("the setting-state examples", () => {
  it("swaps a primitive and merges nothing", () => {
    const settings = primitive<{ a?: number; b?: number }>({ a: 1, b: 2 });
    settings.$set({ a: 3 });
    expect(settings.$get()).toEqual({ a: 3 });
  });

  it("writes listed branches and replaces everything with a batch", () => {
    const app = composite({
      count: 0,
      user: composite({ age: 1, name: "A" }),
    });
    app.$set({ user: { name: "B" } });
    expect(app.$get()).toEqual({ count: 0, user: { age: 1, name: "B" } });

    const heard = vi.fn();
    app.$subscribe(heard, { immediate: false });
    batch(() => {
      app.$reset();
      app.$set({ count: 5, user: { name: "C" } });
    });
    expect(app.$get()).toEqual({ count: 5, user: { age: 1, name: "C" } });
    expect(heard).toHaveBeenCalledTimes(1);
  });

  it("writes collection entries and clears", () => {
    const drafts = collection((id: string) =>
      composite({ lines: primitive<string[]>([]), note: id })
    );
    drafts.$set({ acme: { lines: ["a"] } });
    expect(drafts("acme").lines.$get()).toEqual(["a"]);
    drafts.$clear();
    expect(drafts.$keys()).toEqual([]);
  });
});

describe("the connection and lifecycle examples", () => {
  it("shares a store between composites", () => {
    const a = composite({ n: 1 });
    const c = composite({ a });
    const d = composite({ a, other: primitive("x") });
    expect(c.a === a && d.a === a).toBe(true);
    a.n.$set(2);
    expect(c.$get().a.n).toBe(2);
    expect(d.$get().a.n).toBe(2);
  });

  it("ties a timer to the store's lifetime", () => {
    vi.useFakeTimers();
    const app = composite({ count: 0 });
    const timer = setInterval(() => app.count.$set((n) => n + 1), 1000);
    app.$onDispose(() => clearInterval(timer));
    vi.advanceTimersByTime(2000);
    expect(app.count.$get()).toBe(2);
    app.$dispose();
    vi.advanceTimersByTime(5000);
    expect(app.count.$get()).toBe(2);
    vi.useRealTimers();
  });

  it("removes a cleanup that was unsubscribed", () => {
    const store = primitive(0);
    const cleanup = vi.fn();
    store.$onDispose(cleanup)();
    store.$dispose();
    expect(cleanup).not.toHaveBeenCalled();
  });
});

describe("the context-store example", () => {
  it("creates one store per provider from its props, kept across rerenders", () => {
    const [CounterProvider, useCounterStore] = contextStore(
      (props: { start: number }) => {
        const [store] = useState(() => primitive(props.start));
        return store;
      }
    );
    function Counter() {
      const store = useCounterStore();
      const [count] = store.$use();
      return <span>{count}</span>;
    }
    const view = render(
      <CounterProvider value={{ start: 5 }}>
        <Counter />
      </CounterProvider>
    );
    expect(view.container.textContent).toBe("5");
    view.rerender(
      <CounterProvider value={{ start: 9 }}>
        <Counter />
      </CounterProvider>
    );
    expect(view.container.textContent).toBe("5");
  });
});

describe("the persistence examples", () => {
  type Draft = { lines: string[]; note: string };

  it("hydrates a composite, then saves later changes", () => {
    localStorage.setItem(
      "draft:u1:o1",
      JSON.stringify({ $version: 2, state: { lines: ["a"], note: "n" } })
    );
    const adapter = localAdapter<Draft>("draft:u1:o1", {
      version: 2,
    });
    const store = composite({
      lines: primitive<string[]>([]),
      note: primitive(""),
    });
    const persistor = persist(store, adapter);

    expect(store.$get()).toEqual({ lines: ["a"], note: "n" });
    expect(persistor.hydrated.$get()).toBe(true);
    store.note.$set("edited");
    expect(JSON.parse(localStorage.getItem("draft:u1:o1")!)).toEqual({
      $version: 2,
      state: { lines: ["a"], note: "edited" },
    });
    persistor.dispose();
  });

  it("saves a primitive with the subscribe-and-set pattern", () => {
    const [get, set] = localAdapter<number>("my-counter-key");
    const counter = primitive(get(0));
    counter.$subscribe(set, { immediate: false });
    counter.$set(3);
    expect(localStorage.getItem("my-counter-key")).toBe("3");
  });

  it("persists each collection entry under its own key", () => {
    const drafts = collection((id: string) => primitive(id));
    persist(drafts, (id) => localAdapter<string>(`entry:${id}`));
    drafts("a").$set("changed");
    expect(localStorage.getItem("entry:a")).toBe('"changed"');
  });

  it("follows another tab with watch: true on an async adapter", async () => {
    fakeBroadcastChannel();
    const data = new Map<string, string>();
    const make = () =>
      asyncAdapter<string>("draft", {
        getItem: (key) => Promise.resolve(data.get(key)),
        removeItem: (key) => {
          data.delete(key);
          return Promise.resolve();
        },
        setItem: (key, value) => {
          data.set(key, value);
          return Promise.resolve();
        },
        watch: true,
      });
    const store = primitive("");
    await persist(store, make()).hydrate();
    await make()[1]("from another tab");
    await vi.waitFor(() => expect(store.$get()).toBe("from another tab"));
  });

  it("follows a fully populated storage event, and resets on a removal", () => {
    const store = primitive("initial");
    persist(store, localAdapter<string>("draft"));
    localStorage.setItem("draft", JSON.stringify("changed"));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "draft",
        newValue: JSON.stringify("changed"),
        storageArea: localStorage,
      })
    );
    expect(store.$get()).toBe("changed");

    localStorage.removeItem("draft");
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "draft",
        newValue: null,
        storageArea: localStorage,
      })
    );
    expect(store.$get()).toBe("initial");

    store.$set("later");
    expect(localStorage.getItem("draft")).toBe('"later"');
  });

  it("rejects a stored state of the wrong shape with validate", () => {
    localStorage.setItem("draft", JSON.stringify({ lines: 5 }));
    const store = primitive<{ lines: string[] }>({ lines: [] });
    persist(
      store,
      localAdapter<{ lines: string[] }>("draft", {
        validate: (state) =>
          Array.isArray((state as { lines?: unknown }).lines)
            ? (state as { lines: string[] })
            : undefined,
      })
    );
    expect(store.$get()).toEqual({ lines: [] });
  });

  it("sweeps stored keys of entries that were never created", () => {
    localStorage.setItem("draft:other", '"theirs"');
    localStorage.setItem("unrelated", '"keep"');
    const drafts = collection((id: string) => primitive(id));
    persist(drafts, (id) => localAdapter<string>(`draft:${id}`));
    drafts("mine").$set("saved");

    drafts.$clear();
    expect(localStorage.getItem("draft:mine")).toBeNull();
    expect(localStorage.getItem("draft:other")).toBe('"theirs"');

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("draft:")) localStorage.removeItem(key);
    }
    expect(localStorage.getItem("draft:other")).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe('"keep"');
  });
});
