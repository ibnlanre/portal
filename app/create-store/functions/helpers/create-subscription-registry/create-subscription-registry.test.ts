import { describe, expect, it, vi } from "vitest";

import { createSubscriptionRegistry } from "./index";

describe("createSubscriptionRegistry", () => {
  it("tracks paths while subscribers remain", () => {
    const registry = createSubscriptionRegistry<string>();
    const subscriber = vi.fn();

    registry.add("a.b", subscriber);
    expect(registry.has("a.b")).toBe(true);
    expect(registry.size()).toBe(1);

    registry.add("a.b", vi.fn());
    expect(registry.size()).toBe(1);

    registry.add("a.c", vi.fn());
    expect(registry.size()).toBe(2);
  });

  it("reclaims a path once its last subscriber leaves", () => {
    const registry = createSubscriptionRegistry<string>();
    const first = vi.fn();
    const second = vi.fn();

    registry.add("a.b", first);
    registry.add("a.b", second);
    registry.remove("a.b", first);
    expect(registry.has("a.b")).toBe(true);

    registry.remove("a.b", second);
    expect(registry.has("a.b")).toBe(false);
    expect(registry.size()).toBe(0);
  });

  it("ignores removal of unknown paths and subscribers", () => {
    const registry = createSubscriptionRegistry<string>();
    const subscriber = vi.fn();

    registry.remove("missing", subscriber);
    registry.add("a.b", vi.fn());
    registry.remove("a.b", subscriber);
    expect(registry.has("a.b")).toBe(true);
  });

  it("visits only paths with live subscribers", () => {
    const registry = createSubscriptionRegistry<string>();
    const visited: string[] = [];
    const released = vi.fn();

    registry.add("kept", vi.fn());
    registry.add("released", released);
    registry.remove("released", released);

    registry.forEach((_, key) => visited.push(key));
    expect(visited).toEqual(["kept"]);
  });

  it("supports re-subscribing to a reclaimed path", () => {
    const registry = createSubscriptionRegistry<string>();
    const subscriber = vi.fn();

    registry.add("a.b", subscriber);
    registry.remove("a.b", subscriber);
    registry.add("a.b", subscriber);

    expect(registry.has("a.b")).toBe(true);
    registry.forEach((set) => expect(set.has(subscriber)).toBe(true));
  });
});
