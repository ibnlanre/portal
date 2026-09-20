import { describe, expect, expectTypeOf, it } from "vitest";

import { createStore } from "../index";

describe("dynamic shape contract", () => {
  it("exposes added dictionary entries through dot and relative/absolute paths", () => {
    const store = createStore<{ users: Record<string, { online: boolean }> }>({
      users: {},
    });
    expect(store.users.ridwan).toBeUndefined();
    const pending = store.$at("users.ridwan");
    expect(pending.$get()).toBeUndefined();
    store.users.$set({ ridwan: { online: true } });
    expect(store.users.ridwan).toBe(pending);
    expect(store.users.$at("ridwan")).toBe(pending);
    expect(store.users.ridwan?.$get()?.online).toBe(true);
    expect(Object.keys(store.users)).toEqual(["ridwan"]);
    expect("ridwan" in store.users).toBe(true);
  });
  it("materializes an absent optional path and keeps its handle after clearing", () => {
    const store = createStore<{ profile?: { name: string } }>({});
    expect(store.profile).toBeUndefined();
    const name = store.$at("profile.name");
    expectTypeOf(name.$get()).toEqualTypeOf<string | undefined>();
    name.$set("A");
    expect(store.$get()).toEqual({ profile: { name: "A" } });
    store.$at("profile").$set(undefined);
    expect(name.$get()).toBeUndefined();
    name.$set("B");
    expect(store.$at("profile.name")).toBe(name);
    expect(name.$get()).toBe("B");
  });
  it("keeps null as a value and allows an explicit path to restore descendants", () => {
    const store = createStore<{ profile: null | { name: string } }>({
      profile: null,
    });
    const name = store.$at("profile.name");
    expectTypeOf(name.$get()).toEqualTypeOf<string | undefined>();
    name.$set("A");
    expect(store.$get()).toEqual({ profile: { name: "A" } });
    store.profile.$set(null);
    expect(name.$get()).toBeUndefined();
  });
});
