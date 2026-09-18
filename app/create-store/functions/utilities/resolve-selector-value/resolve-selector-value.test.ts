import { describe, expect, it, vi } from "vitest";

import { resolveSelectorValue } from "./index";

type State = { count: number; nested?: { value: string } };

describe("resolveSelectorValue", () => {
  it("returns the current snapshot when selector is undefined", () => {
    const state: State = { count: 1, nested: { value: "a" } };
    const result = resolveSelectorValue(state);
    expect(result).toEqual(state);
    expect(result).toBe(state);
  });

  it("returns the selector result when selector is a function", () => {
    const state: State = { count: 2 };
    const selector = (s: State) => s.count * 2;
    const result = resolveSelectorValue(state, selector);
    expect(result).toBe(4);
  });

  it("calls selector with the current snapshot", () => {
    const state: State = { count: 5 };
    const selector = vi.fn((s: State) => s.count);

    resolveSelectorValue(state, selector);
    expect(selector.mock.calls[0][0]).toBe(state);
  });

  it("works with primitive state", () => {
    const state = 42;
    const result = resolveSelectorValue(state);
    expect(result).toBe(42);
  });

  it("returns correct value when selector returns a different type", () => {
    const state: State = { count: 10 };
    const selector = (s: State) => String(s.count);

    const result = resolveSelectorValue(state, selector);
    expect(result).toBe("10");
  });

  it("returns the same value for the same state and selector", () => {
    const state: State = { count: 20 };
    const selector = (s: State) => s.count;

    const result1 = resolveSelectorValue(state, selector);
    const result2 = resolveSelectorValue(state, selector);

    expect(result1).toBe(result2);
  });
});
