import { describe, expect, it } from "vitest";

import { mergeFunctions } from "./index";

describe("mergeFunctions", () => {
  it("merges top-level function properties onto the target", () => {
    const target = { count: 0 } as { count: number; increment: () => void };
    const source = { count: 0, increment: () => {} };

    const result = mergeFunctions(target, source);

    expect(result.count).toBe(0);
    expect(result.increment).toBe(source.increment);
  });

  it("does not overwrite non-function target values", () => {
    const target = { count: 5 };
    const source = { count: 0, increment: () => {} };

    const result = mergeFunctions(target, source);

    expect(result.count).toBe(5);
  });

  it("merges nested function properties recursively", () => {
    const source = {
      user: { name: "John", load: () => {} },
    };
    const target = { user: { name: "John" } } as typeof source;

    const result = mergeFunctions(target, source);

    expect(result.user.name).toBe("John");
    expect(result.user.load).toBe(source.user.load);
  });

  it("handles circular references", () => {
    const target: any = { name: "target" };
    target.self = target;

    const source: any = { name: "source", helper: () => {} };
    source.self = source;

    expect(() => mergeFunctions(target, source)).not.toThrow();
    expect(target.helper).toBe(source.helper);
  });

  it("returns the target unchanged when source is not a dictionary", () => {
    const target = { count: 0 };
    expect(mergeFunctions(target, "not a dictionary")).toBe(target);
  });
});
