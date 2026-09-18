import type { AsyncSetBrowserStorage } from "@/create-store/types/async-browser-storage-adapter";
import type { Subscriber } from "@/create-store/types/subscriber";

import { describe, it } from "vitest";

import { createStore } from "@/create-store";
import { createLocalStorageAdapter } from "@/create-store/functions/adapters/create-local-storage-adapter";

/**
 * The read surface is a `Snapshot`, which is read-only and types arrays as
 * `ReadonlyArray`. Persisting never mutates a value, so the storage setters
 * accept the snapshot type and a store can be wired straight into an adapter.
 *
 * `Snapshot` projects readonly *properties*, which stay assignable to mutable
 * ones, but `ReadonlyArray` is not assignable to `Array`. Every assignment
 * below is therefore enforced by `tsc --noEmit`, which is what keeps the
 * documented `store.$subscribe(set, false)` wiring working for array state.
 */
describe("persistence accepts the read surface", () => {
  it("accepts a top-level array state", () => {
    const [getTodos, setTodos] = createLocalStorageAdapter<string[]>("todos");

    const todos = createStore<string[]>(["a"]);

    const persist: Subscriber<string[]> = setTodos;

    todos.$subscribe(persist, false);
    setTodos(todos.$get());
    setTodos([...todos.$get()]);

    getTodos([]);
  });

  it("accepts an array nested inside an object state", () => {
    const [, setPreferences] = createLocalStorageAdapter<{
      list: string[];
      theme: string;
    }>("preferences");

    const preferences = createStore({ list: ["a"], theme: "light" });

    const persist: Subscriber<{ list: string[]; theme: string }> =
      setPreferences;

    preferences.$subscribe(persist, false);
    setPreferences(preferences.$get());
  });

  it("accepts an async storage setter", () => {
    const todos = createStore<string[]>(["a"]);

    const setStoredTodos: AsyncSetBrowserStorage<string[]> = async () => {};

    const persist: Subscriber<string[]> = setStoredTodos;

    todos.$subscribe(persist, false);
  });

  it("still accepts a mutable value written by hand", () => {
    const [, setTodos] = createLocalStorageAdapter<string[]>("todos");

    setTodos(["mutable", "array"]);
    setTodos(undefined);
  });
});
