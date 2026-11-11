import type { AsyncSetBrowserStorage } from "@/create-store/types/async-browser-storage-adapter";

import { describe, expectTypeOf, it } from "vitest";

import { cookieAdapter } from "@/create-store/functions/adapters/cookie-adapter";
import { localAdapter } from "@/create-store/functions/adapters/local-adapter";

import { composite } from "../functions/library/composite";
import { primitive } from "../functions/library/primitive";
import { persist } from "../functions/utilities/persist";

/**
 * A read has exactly the state type, so a store can be wired straight into an
 * adapter. Every assignment below is enforced by `tsc --noEmit`, which keeps the
 * documented `store.$subscribe(set, { immediate: false })` wiring working for array state.
 */
describe("persistence accepts the read surface", () => {
  it("accepts a top-level array state", () => {
    const [getTodos, setTodos] = localAdapter<string[]>("todos");

    const todos = primitive<string[]>(["a"]);

    const persist: (value: string[]) => void = setTodos;

    todos.$subscribe(persist, { immediate: false });
    setTodos(todos.$get());
    setTodos([...todos.$get()]);

    getTodos([]);
  });

  it("accepts an array nested inside an object state", () => {
    const [, setPreferences] = localAdapter<{
      list: string[];
      theme: string;
    }>("preferences");

    const preferences = composite({ list: ["a"], theme: "light" });

    const persist: (value: { list: string[]; theme: string }) => void =
      setPreferences;

    preferences.$subscribe(persist, { immediate: false });
    setPreferences(preferences.$get());
  });

  it("accepts an async storage setter", () => {
    const todos = primitive<string[]>(["a"]);

    const setStoredTodos: AsyncSetBrowserStorage<string[]> = async () => {};

    const persist: (value: string[]) => void = setStoredTodos;

    todos.$subscribe(persist, { immediate: false });
  });

  it("still accepts a mutable value written by hand", () => {
    const [, setTodos] = localAdapter<string[]>("todos");

    setTodos(["mutable", "array"]);
    setTodos(undefined);
  });

  it("accepts a cookie setter, whose second parameter takes options", () => {
    const [, setCookie] = cookieAdapter<string[]>("todos");
    const todos = primitive<string[]>(["a"]);

    todos.$subscribe(setCookie, { immediate: false });
  });

  it("returns the plain two-element tuple, with nothing added", () => {
    const adapter = localAdapter<number>("k");
    const [get, set] = adapter;
    const pair: [typeof get, typeof set] = adapter;
    void pair;
    expectTypeOf(adapter.length).toEqualTypeOf<2>();
    // @ts-expect-error a watcher is not part of the public adapter type
    void adapter.watch;
  });

  it("lets persist take an adapter or a plain tuple, and only false for sync", () => {
    const store = primitive(1);
    persist(store, localAdapter<number>("k"));
    persist(store, [() => 1, () => {}] as const);
    persist(store, localAdapter<number>("k"), { sync: false });
    // @ts-expect-error following is the default; the only option is false
    persist(store, localAdapter<number>("k"), { sync: true });
  });

  it("takes subscribe options, never a boolean", () => {
    const store = primitive(1);
    store.$subscribe(() => {}, { immediate: false });
    store.$subscribe(() => {});
    // @ts-expect-error the boolean overload is gone
    store.$subscribe(() => {}, false);
    // @ts-expect-error the boolean overload is gone
    store.$subscribe(() => {}, true);
  });
});
