import type { DependencyList } from "react";

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSync } from "./index";
import { combine } from "@/create-store/functions/helpers/combine";

describe("useSync", () => {
  it("should call effect on mount", () => {
    const effect = vi.fn();

    renderHook(() => useSync(effect));

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("should call effect on mount with cleanup function", () => {
    const cleanup = vi.fn();
    const effect = vi.fn(() => cleanup);

    const { unmount } = renderHook(() => useSync(effect));

    expect(effect).toHaveBeenCalledTimes(1);

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("should not re-run effect when dependencies don't change", () => {
    const effect = vi.fn();
    const dependencies = [1, "test", { id: 1 }];

    const { rerender } = renderHook(({ deps }) => useSync(effect, deps), {
      initialProps: { deps: dependencies },
    });

    expect(effect).toHaveBeenCalledTimes(1);

    // Re-render with same dependencies
    rerender({ deps: dependencies });

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("should re-run effect when dependencies change", () => {
    const effect = vi.fn();

    const { rerender } = renderHook(({ deps }) => useSync(effect, deps), {
      initialProps: { deps: [1, 2] },
    });

    expect(effect).toHaveBeenCalledTimes(1);

    // Change dependencies
    rerender({ deps: [1, 3] });

    expect(effect).toHaveBeenCalledTimes(2);
  });

  it("should handle deep equality comparison for object dependencies", () => {
    const effect = vi.fn();

    const { rerender } = renderHook(({ deps }) => useSync(effect, deps), {
      initialProps: { deps: [{ a: 1, b: { c: 2 } }] },
    });

    expect(effect).toHaveBeenCalledTimes(1);

    // Re-render with deeply equal object
    rerender({ deps: [{ a: 1, b: { c: 2 } }] });

    expect(effect).toHaveBeenCalledTimes(1);

    // Re-render with different object
    rerender({ deps: [{ a: 1, b: { c: 3 } }] });

    expect(effect).toHaveBeenCalledTimes(2);
  });

  it("should handle array dependencies correctly", () => {
    const effect = vi.fn();

    const { rerender } = renderHook(({ deps }) => useSync(effect, deps), {
      initialProps: { deps: [[1, 2, 3]] },
    });

    expect(effect).toHaveBeenCalledTimes(1);

    // Re-render with same array content
    rerender({ deps: [[1, 2, 3]] });

    expect(effect).toHaveBeenCalledTimes(1);

    // Re-render with different array
    rerender({ deps: [[1, 2, 4]] });

    expect(effect).toHaveBeenCalledTimes(2);
  });

  it("should work without dependencies", () => {
    const effect = vi.fn();

    const { rerender } = renderHook(() => useSync(effect));

    expect(effect).toHaveBeenCalledTimes(1);

    // Re-render without dependencies should not re-run effect
    rerender();

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("should handle undefined dependencies correctly", () => {
    const effect = vi.fn();

    const { rerender } = renderHook<void, { deps?: number[] }>(
      ({ deps }) => useSync(effect, deps),
      { initialProps: { deps: undefined } }
    );

    expect(effect).toHaveBeenCalledTimes(1);

    // Re-render with undefined
    rerender({ deps: undefined });

    expect(effect).toHaveBeenCalledTimes(1);

    // Change to actual dependencies
    rerender({ deps: [1] });

    expect(effect).toHaveBeenCalledTimes(2);
  });

  it("should handle empty dependency array", () => {
    const effect = vi.fn();

    const { rerender } = renderHook<void, { deps: DependencyList }>(
      ({ deps }) => useSync(effect, deps),
      { initialProps: { deps: [] } }
    );

    expect(effect).toHaveBeenCalledTimes(1);

    // Re-render with empty array should not re-run
    rerender({ deps: [] });

    expect(effect).toHaveBeenCalledTimes(1);

    // Add dependency
    rerender({ deps: [1] });

    expect(effect).toHaveBeenCalledTimes(2);
  });

  it("should handle multiple dependency changes", () => {
    const effect = vi.fn();

    const { rerender } = renderHook(({ deps }) => useSync(effect, deps), {
      initialProps: { deps: [1, "a", true] },
    });

    expect(effect).toHaveBeenCalledTimes(1);

    // Change first dependency
    rerender({ deps: [2, "a", true] });
    expect(effect).toHaveBeenCalledTimes(2);

    // Change second dependency
    rerender({ deps: [2, "b", true] });
    expect(effect).toHaveBeenCalledTimes(3);

    // Change third dependency
    rerender({ deps: [2, "b", false] });
    expect(effect).toHaveBeenCalledTimes(4);
  });

  it("should properly clean up previous effect when dependencies change", () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();
    let callCount = 0;

    const effect = vi.fn(() => {
      callCount++;
      return callCount === 1 ? cleanup1 : cleanup2;
    });

    const { rerender, unmount } = renderHook(
      ({ deps }) => useSync(effect, deps),
      { initialProps: { deps: [1] } }
    );

    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup1).not.toHaveBeenCalled();

    // Change dependencies - should clean up previous and run new
    rerender({ deps: [2] });

    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledTimes(2);

    // Unmount - should clean up the latest effect
    unmount();

    expect(cleanup2).toHaveBeenCalledTimes(1);
  });

  it("should handle complex nested object dependencies", () => {
    const effect = vi.fn();
    const complexObj = {
      metadata: { active: true, created: new Date("2023-01-01") },
      permissions: ["read", "write"],
      user: { id: 1, profile: { name: "John", settings: { theme: "dark" } } },
    };

    const { rerender } = renderHook(({ deps }) => useSync(effect, deps), {
      initialProps: { deps: [complexObj] },
    });

    expect(effect).toHaveBeenCalledTimes(1);

    // Deep equal object should not trigger re-run
    const equalObj = {
      metadata: { active: true, created: new Date("2023-01-01") },
      permissions: ["read", "write"],
      user: { id: 1, profile: { name: "John", settings: { theme: "dark" } } },
    };

    rerender({ deps: [equalObj] });
    expect(effect).toHaveBeenCalledTimes(1);

    // Change a nested property
    const changedObj = combine(complexObj, {
      user: { profile: { name: "Jane" } },
    });

    rerender({ deps: [changedObj] });
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
