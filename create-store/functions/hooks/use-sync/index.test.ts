import type { DependencyList } from "react";

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSync } from "./index";
import { combine } from "@/create-store/functions/helpers/combine";

describe("useSync", () => {
  it("should call factory on mount and return result", () => {
    const factory = vi.fn(() => "test result");

    const { result } = renderHook(() => useSync(factory));

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe("test result");
  });

  it("should call factory with parameters", () => {
    const factory = vi.fn((params: { value: number }) => params.value * 2);
    const params = { value: 5 };

    const { result } = renderHook(() => useSync(factory, params));

    expect(factory).toHaveBeenCalledWith(params);
    expect(result.current).toBe(10);
  });

  it("should not re-run factory when dependencies don't change", () => {
    const factory = vi.fn(() => "test result");
    const dependencies = [1, "test", { id: 1 }];

    const { rerender } = renderHook(({ deps }) => useSync(factory, deps), {
      initialProps: { deps: dependencies },
    });

    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ deps: dependencies });

    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("should re-run factory when dependencies change", () => {
    const factory = vi.fn((deps: number[]) => deps.reduce((a, b) => a + b, 0));

    const { rerender, result } = renderHook(
      ({ deps }) => useSync(factory, deps),
      {
        initialProps: { deps: [1, 2] },
      }
    );

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(3);

    rerender({ deps: [1, 3] });

    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current).toBe(4);
  });

  it("should handle deep equality comparison for object dependencies", () => {
    const factory = vi.fn(
      (obj: { a: number; b: { c: number } }) => obj.a + obj.b.c
    );

    const { rerender, result } = renderHook(
      ({ deps }) => useSync(factory, deps),
      {
        initialProps: { deps: { a: 1, b: { c: 2 } } },
      }
    );

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(3);

    rerender({ deps: { a: 1, b: { c: 2 } } });

    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ deps: { a: 1, b: { c: 3 } } });

    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current).toBe(4);
  });

  it("should handle array dependencies correctly", () => {
    const factory = vi.fn((arr: number[]) => arr.reduce((a, b) => a + b, 0));

    const { rerender, result } = renderHook(
      ({ deps }) => useSync(factory, deps),
      {
        initialProps: { deps: [1, 2, 3] },
      }
    );

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(6);

    rerender({ deps: [1, 2, 3] });

    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ deps: [1, 2, 4] });

    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current).toBe(7);
  });

  it("should work without dependencies", () => {
    const factory = vi.fn(() => "constant result");

    const { rerender, result } = renderHook(() => useSync(factory));

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe("constant result");

    rerender();

    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("should handle undefined dependencies correctly", () => {
    const factory = vi.fn((deps?: number[]) => deps?.length ?? 0);

    const { rerender, result } = renderHook<void, { deps?: number[] }>(
      ({ deps }) => useSync(factory, deps),
      { initialProps: { deps: undefined } }
    );

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(0);

    rerender({ deps: undefined });

    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ deps: [1] });

    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current).toBe(1);
  });

  it("should handle empty dependency array", () => {
    const factory = vi.fn((deps: DependencyList) => deps.length);

    const { rerender, result } = renderHook<void, { deps: DependencyList }>(
      ({ deps }) => useSync(factory, deps),
      { initialProps: { deps: [] } }
    );

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(0);

    rerender({ deps: [] });

    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ deps: [1] });

    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current).toBe(1);
  });

  it("should handle multiple dependency changes", () => {
    const factory = vi.fn(
      (deps: [number, string, boolean]) => `${deps[0]}-${deps[1]}-${deps[2]}`
    );

    const { rerender, result } = renderHook(
      ({ deps }) => useSync(factory, deps),
      {
        initialProps: { deps: [1, "a", true] as [number, string, boolean] },
      }
    );

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe("1-a-true");

    rerender({ deps: [2, "a", true] });
    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current).toBe("2-a-true");

    rerender({ deps: [2, "b", true] });
    expect(factory).toHaveBeenCalledTimes(3);
    expect(result.current).toBe("2-b-true");

    rerender({ deps: [2, "b", false] });
    expect(factory).toHaveBeenCalledTimes(4);
    expect(result.current).toBe("2-b-false");
  });

  it("should memoize results correctly across re-renders", () => {
    const factory = vi.fn((value: number) => ({ computedValue: value * 2 }));

    const { rerender, result } = renderHook(
      ({ value }) => useSync(factory, value),
      { initialProps: { value: 5 } }
    );

    const firstResult = result.current;
    expect(factory).toHaveBeenCalledTimes(1);
    expect(firstResult.computedValue).toBe(10);

    rerender({ value: 5 });

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(firstResult);

    rerender({ value: 10 });

    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current).not.toBe(firstResult);
    expect(result.current.computedValue).toBe(20);
  });

  it("should handle complex nested object dependencies", () => {
    const complexObj = {
      metadata: { active: true, created: new Date("2023-01-01") },
      permissions: ["read", "write"],
      user: { id: 1, profile: { name: "John", settings: { theme: "dark" } } },
    };

    const factory = vi.fn(
      (obj: typeof complexObj) =>
        `${obj.user.profile.name}-${obj.user.profile.settings.theme}`
    );

    const { rerender, result } = renderHook(
      ({ deps }) => useSync(factory, deps),
      {
        initialProps: { deps: complexObj },
      }
    );

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe("John-dark");

    const equalObj = {
      metadata: { active: true, created: new Date("2023-01-01") },
      permissions: ["read", "write"],
      user: { id: 1, profile: { name: "John", settings: { theme: "dark" } } },
    };

    rerender({ deps: equalObj });
    expect(factory).toHaveBeenCalledTimes(1);

    const changedObj = combine(complexObj, {
      user: { profile: { name: "Jane" } },
    });

    rerender({ deps: changedObj });
    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current).toBe("Jane-dark");
  });
});
