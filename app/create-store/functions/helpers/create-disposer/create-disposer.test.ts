import { describe, expect, it, vi } from "vitest";

import { createDisposer } from "./index";

describe("createDisposer", () => {
  it("runs attached cleanups once", () => {
    const disposal = createDisposer();
    const cleanup = vi.fn();
    disposal.add(cleanup);
    disposal.run();
    disposal.run();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(disposal.isDisposed()).toBe(true);
  });

  it("does not run a detached cleanup", () => {
    const disposal = createDisposer();
    const cleanup = vi.fn();
    disposal.add(cleanup)();
    disposal.run();
    expect(cleanup).not.toHaveBeenCalled();
  });

  it("runs a cleanup attached after disposal immediately", () => {
    const disposal = createDisposer();
    disposal.run();
    const cleanup = vi.fn();
    disposal.add(cleanup);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("runs every cleanup before reporting failures", () => {
    const disposal = createDisposer();
    const after = vi.fn();
    disposal.add(() => {
      throw new Error("first");
    });
    disposal.add(after);
    expect(() => disposal.run()).toThrow("first");
    expect(after).toHaveBeenCalled();
  });

  it("reports several failures together", () => {
    const disposal = createDisposer();
    disposal.add(() => {
      throw new Error("a");
    });
    disposal.add(() => {
      throw new Error("b");
    });
    expect(() => disposal.run()).toThrow(AggregateError);
  });
});
