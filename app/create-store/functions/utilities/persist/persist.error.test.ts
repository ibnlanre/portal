import { afterEach, describe, expect, it, vi } from "vitest";

import { asyncAdapter } from "@/create-store/functions/adapters/async-adapter";
import { collection } from "@/create-store/functions/library/collection";
import { primitive } from "@/create-store/functions/library/primitive";

import { persist } from "./index";

afterEach(() => {
  vi.restoreAllMocks();
});

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("persist { onError }", () => {
  it("is called for a rejected read with the error and action 'read'", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onError = vi.fn();
    const failure = new Error("offline");
    const persistor = persist(
      primitive(1),
      asyncAdapter<number>("n", {
        getItem: () => Promise.reject(failure),
        removeItem: () => {},
        setItem: () => {},
      }),
      { onError }
    );
    await persistor.hydrate();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(failure, { action: "read" });
    expect(consoleError).not.toHaveBeenCalled();
    expect(persistor.hydrated.$get()).toBe(true);
  });

  it("is called for a read that throws synchronously", () => {
    const onError = vi.fn();
    const failure = new Error("blocked");
    persist(
      primitive(1),
      [
        () => {
          throw failure;
        },
        () => {},
      ],
      { onError }
    );
    expect(onError).toHaveBeenCalledWith(failure, { action: "read" });
  });

  it("is called for a write that throws, and the store still changes", () => {
    const onError = vi.fn();
    const failure = new Error("full");
    const store = primitive(1);
    persist(
      store,
      [
        () => undefined,
        () => {
          throw failure;
        },
      ],
      { onError }
    );
    expect(() => store.$set(2)).not.toThrow();
    expect(store.$get()).toBe(2);
    expect(onError).toHaveBeenCalledWith(failure, { action: "write" });
  });

  it("is called for a write that rejects", async () => {
    const onError = vi.fn();
    const failure = new Error("full");
    const store = primitive(1);
    persist(store, [() => undefined, () => Promise.reject(failure)], {
      onError,
    });
    store.$set(2);
    await settle();
    expect(onError).toHaveBeenCalledWith(failure, { action: "write" });
  });

  it("names the key for a collection entry's read", async () => {
    const onError = vi.fn();
    const failure = new Error("offline");
    const drafts = collection((id: string) => primitive(id));
    drafts("acme");
    const persistor = persist(
      drafts,
      () => [() => Promise.reject(failure), () => {}],
      { onError }
    );
    await persistor.hydrate();
    expect(onError).toHaveBeenCalledWith(failure, {
      action: "read",
      key: "acme",
    });
  });

  it("names the key for a collection entry's write", () => {
    const onError = vi.fn();
    const failure = new Error("full");
    const drafts = collection((id: string) => primitive(id));
    persist(
      drafts,
      () => [
        () => undefined,
        () => {
          throw failure;
        },
      ],
      { onError }
    );
    drafts("acme").$set("x");
    expect(onError).toHaveBeenCalledWith(failure, {
      action: "write",
      key: "acme",
    });
  });

  it("is called for a removal that fails when the collection removes an entry", () => {
    const onError = vi.fn();
    const failure = new Error("no delete");
    const drafts = collection((id: string) => primitive(id));
    persist(
      drafts,
      () => [
        () => undefined,
        (value?: string) => {
          if (value === undefined) throw failure;
        },
      ],
      { onError }
    );
    drafts("acme");
    expect(() => drafts.$delete("acme")).not.toThrow();
    expect(onError).toHaveBeenCalledWith(failure, {
      action: "remove",
      key: "acme",
    });
    expect(drafts.$has("acme")).toBe(false);
  });

  it("is called for a removal that rejects", async () => {
    const onError = vi.fn();
    const failure = new Error("no delete");
    const drafts = collection((id: string) => primitive(id));
    persist(
      drafts,
      () => [
        () => undefined,
        (value?: string) =>
          value === undefined ? Promise.reject(failure) : undefined,
      ],
      { onError }
    );
    drafts("acme");
    drafts.$clear();
    await settle();
    expect(onError).toHaveBeenCalledWith(failure, {
      action: "remove",
      key: "acme",
    });
  });

  it("without onError, console.error still reports each kind", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const store = primitive(1);
    persist(store, [
      () => Promise.reject(new Error("read")),
      () => {
        throw new Error("write");
      },
    ]);
    await settle();
    store.$set(2);
    expect(consoleError).toHaveBeenCalledTimes(2);
  });

  it("a throwing onError does not break the store or the write that failed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const onError = vi.fn(() => {
      throw new Error("handler bug");
    });
    const store = primitive(1);
    const persistor = persist(
      store,
      [
        () => Promise.reject(new Error("read")),
        () => {
          throw new Error("write");
        },
      ],
      { onError }
    );
    await persistor.hydrate();
    expect(persistor.hydrated.$get()).toBe(true);

    expect(() => store.$set(2)).not.toThrow();
    expect(store.$get()).toBe(2);
    expect(onError).toHaveBeenCalledTimes(2);

    store.$set(3);
    expect(store.$get()).toBe(3);
  });
});
