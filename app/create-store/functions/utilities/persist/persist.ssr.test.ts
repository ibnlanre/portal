import { describe, expect, it, vi } from "vitest";

import { localAdapter } from "@/create-store/functions/adapters/local-adapter";
import { collection } from "@/create-store/functions/library/collection";
import { composite } from "@/create-store/functions/library/composite";
import { primitive } from "@/create-store/functions/library/primitive";

import { persist } from "./index";

describe("persist on the server", () => {
  it("uses the adapter's fallback and never touches storage", () => {
    const [get] = localAdapter<number>("count");
    expect(get()).toBeUndefined();
    expect(get(7)).toBe(7);

    const store = primitive(1);
    const persistor = persist(store, localAdapter<number>("count"));
    expect(persistor.hydrated.$get()).toBe(true);
    expect(store.$get()).toBe(1);
    store.$set(2);
    expect(store.$get()).toBe(2);
  });

  it("follows nothing without a window, and does not throw", () => {
    const store = composite({ n: 1 });
    expect(() =>
      persist(store, localAdapter<{ n: number }>("n"))
    ).not.toThrow();
    expect(() =>
      persist(store, localAdapter<{ n: number }>("n"), {
        sync: false,
      })
    ).not.toThrow();
  });

  it("lets an adapter setter be a subscriber without throwing", () => {
    const [, set] = localAdapter<number>("count");
    const store = primitive(1);
    store.$subscribe(set, { immediate: false });
    expect(() => store.$set(2)).not.toThrow();
  });

  it("persists a collection without a window", () => {
    const drafts = collection((id: string) => primitive(id));
    const listener = vi.fn();
    persist(drafts, (id) => localAdapter<string>(`draft:${id}`));
    drafts.$subscribe(listener, { immediate: false });
    expect(() => drafts("a").$set("b")).not.toThrow();
  });
});
