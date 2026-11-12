import { afterEach, describe, expect, it, vi } from "vitest";

import { fakeBroadcastChannel } from "@/create-store/functions/helpers/channel/fake-broadcast-channel";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

/** One tab: its own copy of the library, so nothing is shared but the channel. */
async function tab(data: Map<string, string>) {
  vi.resetModules();
  const { asyncAdapter } = await import("./index");
  const { collection } =
    await import("@/create-store/functions/library/collection");
  const { primitive } =
    await import("@/create-store/functions/library/primitive");
  const { persist } =
    await import("@/create-store/functions/utilities/persist");

  const drafts = collection((id: string) => primitive(`initial ${id}`));
  const persistor = persist(drafts, (id) =>
    asyncAdapter<string>(`draft:${id}`, {
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
    })
  );
  return { drafts, persistor };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("watch: true on a persisted collection", () => {
  it("opens one channel for the whole collection, not one per entry", async () => {
    const fake = fakeBroadcastChannel();
    const { drafts, persistor } = await tab(new Map());
    for (let index = 0; index < 2000; index++) drafts(`entry-${index}`);
    await persistor.hydrate();
    await settle();

    expect(fake.created).toBe(1);
    expect(fake.open.size).toBe(1);
  });

  it("a write to one entry reaches the same entry in another tab, and no other", async () => {
    fakeBroadcastChannel();
    const data = new Map<string, string>();
    const one = await tab(data);
    const two = await tab(data);
    one.drafts("a");
    one.drafts("b");
    two.drafts("a");
    two.drafts("b");
    await one.persistor.hydrate();
    await two.persistor.hydrate();
    await settle();

    one.drafts("a").$set("written in one");
    await settle();

    expect(two.drafts("a").$get()).toBe("written in one");
    expect(two.drafts("b").$get()).toBe("initial b");
    expect(one.drafts("b").$get()).toBe("initial b");
  });

  it("a removal of one entry resets only that entry in the other tab", async () => {
    fakeBroadcastChannel();
    const data = new Map<string, string>();
    const one = await tab(data);
    const two = await tab(data);
    one.drafts("a").$set("x");
    one.drafts("b").$set("y");
    await settle();
    two.drafts("a");
    two.drafts("b");
    await two.persistor.hydrate();
    await settle();
    expect(two.drafts("a").$get()).toBe("x");

    one.drafts.$delete("a");
    await settle();

    expect(two.drafts("a").$get()).toBe("initial a");
    expect(two.drafts("b").$get()).toBe("y");
  });

  it("the shared channel closes when the collection's persistence is disposed", async () => {
    const fake = fakeBroadcastChannel();
    const { drafts, persistor } = await tab(new Map());
    drafts("a");
    drafts("b");
    await persistor.hydrate();
    expect(fake.open.size).toBe(1);

    persistor.dispose();
    expect(fake.open.size).toBe(0);
  });

  it("separate stores with watch: true still keep their keys apart", async () => {
    fakeBroadcastChannel();
    const data = new Map<string, string>();
    const { asyncAdapter } = await import("./index");
    const { primitive } =
      await import("@/create-store/functions/library/primitive");
    const { persist } =
      await import("@/create-store/functions/utilities/persist");
    const make = (key: string) =>
      asyncAdapter<string>(key, {
        getItem: (k) => Promise.resolve(data.get(k)),
        removeItem: () => {},
        setItem: (k, v) => {
          data.set(k, v);
          return Promise.resolve();
        },
        watch: true,
      });
    const writer = make("one");
    const listenerStore = primitive("initial");
    await persist(listenerStore, make("two")).hydrate();
    await writer[1]("changed");
    await settle();
    expect(listenerStore.$get()).toBe("initial");
  });
});
