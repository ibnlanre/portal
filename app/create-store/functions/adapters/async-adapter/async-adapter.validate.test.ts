import { afterEach, describe, expect, it, vi } from "vitest";

import { primitive } from "@/create-store/functions/library/primitive";
import { persist } from "@/create-store/functions/utilities/persist";

import { asyncAdapter } from "./index";

type Options = Omit<
  Parameters<typeof asyncAdapter<Person>>[1],
  "getItem" | "removeItem" | "setItem"
>;

type Person = { name: string };

function adapter(options: Options, stored: unknown) {
  const data = new Map<string, unknown>([["k", stored]]);
  return asyncAdapter<Person>("k", {
    ...options,
    getItem: (key) => Promise.resolve(data.get(key) as never),
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  });
}

function validate(state: unknown): Person | undefined {
  const value = state as null | Partial<Person>;
  return typeof value?.name === "string" ? (value as Person) : undefined;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("asyncAdapter validate", () => {
  it("accepts a valid state", async () => {
    const [get] = adapter({ validate }, { name: "Ada" });
    expect(await get()).toEqual({ name: "Ada" });
  });

  it("treats a wrong-shape state as absent, without logging", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const [get] = adapter({ validate }, { name: 5 });
    expect(await get({ name: "fallback" })).toEqual({ name: "fallback" });
    expect(error).not.toHaveBeenCalled();
  });

  it("treats a null result as absent", async () => {
    const [get] = adapter({ validate: () => null }, { name: "Ada" });
    expect(await get({ name: "fallback" })).toEqual({ name: "fallback" });
  });

  it("runs after migrate, on the migrated state", async () => {
    const [get] = adapter(
      {
        migrate: (stored) => ({ name: (stored as { old: string }).old }),
        validate,
        version: 2,
      },
      { $version: 1, state: { old: "Ada" } }
    );
    expect(await get()).toEqual({ name: "Ada" });

    const [rejected] = adapter(
      { migrate: () => ({ name: 5 }) as never, validate, version: 2 },
      { $version: 1, state: {} }
    );
    expect(await rejected({ name: "fallback" })).toEqual({ name: "fallback" });
  });

  it("validates a current-version envelope too", async () => {
    const [get] = adapter(
      { validate, version: 1 },
      { $version: 1, state: { name: 5 } }
    );
    expect(await get({ name: "fallback" })).toEqual({ name: "fallback" });
  });

  it("treats a throwing validate as absent and logs", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const [get] = adapter(
      {
        validate: () => {
          throw new Error("bad");
        },
      },
      { name: "Ada" }
    );
    expect(await get({ name: "fallback" })).toEqual({ name: "fallback" });
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("with persist, a rejected stored state leaves the store at its initial value and hydrated", async () => {
    const initial: Person = { name: "initial" };
    const store = primitive<Person>(initial);
    const persistor = persist(store, adapter({ validate }, { name: 5 }));
    await persistor.hydrate();
    expect(store.$get()).toBe(initial);
    expect(persistor.hydrated.$get()).toBe(true);
  });
});
