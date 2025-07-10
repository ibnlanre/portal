import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useInitializer } from "./index";

describe("useInitializer", () => {
  it("calls initializer with context and returns its value", () => {
    const initializer = vi.fn((context: { value: number }) => ({
      result: context.value * 2,
    }));
    const context = { value: 5 };

    const { result } = renderHook(() => useInitializer(initializer, context));

    expect(initializer).toHaveBeenCalledWith(context);
    expect(result.current).toEqual({ result: 10 });
  });

  it("returns memoized value when context does not change", () => {
    const initializer = vi.fn((context: { value: number }) => ({
      result: context.value * 2,
    }));
    const context = { value: 3 };

    const { rerender, result } = renderHook(
      ({ context }) => useInitializer(initializer, context),
      { initialProps: { context } }
    );

    expect(result.current).toEqual({ result: 6 });
    expect(initializer).toHaveBeenCalledTimes(1);

    rerender({ context });
    expect(result.current).toEqual({ result: 6 });
    expect(initializer).toHaveBeenCalledTimes(1);
  });

  it("recomputes when context changes", () => {
    const initializer = vi.fn((context: { value: number }) => ({
      result: context.value * 2,
    }));

    const { rerender, result } = renderHook(
      ({ context }) => useInitializer(initializer, context),
      { initialProps: { context: { value: 2 } } }
    );

    expect(result.current).toEqual({ result: 4 });
    expect(initializer).toHaveBeenCalledTimes(1);

    rerender({ context: { value: 7 } });
    expect(result.current).toEqual({ result: 14 });
    expect(initializer).toHaveBeenCalledTimes(2);
  });
});
