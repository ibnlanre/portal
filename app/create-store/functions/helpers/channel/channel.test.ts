import { afterEach, describe, expect, it, vi } from "vitest";

import { fakeBroadcastChannel } from "./fake-broadcast-channel";
import { channel } from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("channel", () => {
  it("delivers a post to another channel of the same name, and never to itself", () => {
    fakeBroadcastChannel();
    const here = channel("c");
    const there = channel("c");
    const heardHere = vi.fn();
    const heardThere = vi.fn();
    here.watch(heardHere);
    there.watch(heardThere);

    here.post({ removed: true });

    expect(heardThere).toHaveBeenCalledExactlyOnceWith({ removed: true });
    expect(heardHere).not.toHaveBeenCalled();
  });

  it("keeps names apart", () => {
    fakeBroadcastChannel();
    const heard = vi.fn();
    channel("a").watch(heard);
    channel("b").post({ removed: false });
    expect(heard).not.toHaveBeenCalled();
  });

  it("closes when the last watcher stops, and reopens for a later one", () => {
    const fake = fakeBroadcastChannel();
    const mine = channel("c");
    const first = mine.watch(() => {});
    const second = mine.watch(() => {});
    expect(fake.open.size).toBe(1);
    first();
    first();
    expect(fake.open.size).toBe(1);
    second();
    expect(fake.open.size).toBe(0);

    const heard = vi.fn();
    mine.watch(heard);
    channel("c").post({ removed: false });
    expect(fake.open.size).toBe(1);
    expect(heard).toHaveBeenCalledTimes(1);
  });

  it("does not leave a channel open for posting alone", () => {
    const fake = fakeBroadcastChannel();
    channel("c").post({ removed: false });
    expect(fake.open.size).toBe(0);
  });

  it("reports a failing post without throwing", () => {
    const fake = fakeBroadcastChannel();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    fake.failPost = true;
    expect(() => channel("c").post({ removed: false })).not.toThrow();
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("does nothing where there is no BroadcastChannel", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    const mine = channel("c");
    expect(() => mine.post({ removed: false })).not.toThrow();
    expect(() => mine.watch(() => {})()).not.toThrow();
  });
});
