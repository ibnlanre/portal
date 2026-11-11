import { describe, expect, it, vi } from "vitest";

import { registerWatcher, watcherOf } from "./index";

import * as v8 from "node:v8";
import * as vm from "node:vm";

v8.setFlagsFromString("--expose-gc");
const collect: () => void = vm.runInNewContext("gc");

describe("adapter watchers", () => {
  it("finds the watcher of the very tuple a factory registered", () => {
    const watcher = vi.fn(() => () => {});
    const adapter: [() => void, () => void] = [() => {}, () => {}];
    expect(registerWatcher(adapter, watcher)).toBe(adapter);
    expect(watcherOf(adapter)).toBe(watcher);
  });

  it("finds none for a copy, a rebuilt tuple, or an unregistered one", () => {
    const adapter: [() => void, () => void] = [() => {}, () => {}];
    registerWatcher(adapter, () => () => {});
    expect(watcherOf([...adapter])).toBeUndefined();
    expect(watcherOf([adapter[0], adapter[1]])).toBeUndefined();
    expect(watcherOf([() => {}, () => {}])).toBeUndefined();
  });

  it("registers nothing when there is no watcher", () => {
    const adapter: [() => void, () => void] = [() => {}, () => {}];
    registerWatcher(adapter, undefined);
    expect(watcherOf(adapter)).toBeUndefined();
  });

  it("does not keep an unreferenced tuple alive", async () => {
    let ref: WeakRef<object>;
    (() => {
      const adapter: [() => void, () => void] = [() => {}, () => {}];
      registerWatcher(adapter, () => () => {});
      ref = new WeakRef(adapter);
    })();
    for (let attempt = 0; attempt < 20 && ref!.deref(); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5));
      collect();
    }
    expect(ref!.deref()).toBeUndefined();
  });
});
