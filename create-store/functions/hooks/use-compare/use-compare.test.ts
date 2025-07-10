import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCompare } from "./index";

describe("useCompare", () => {
  it("should initialize version to 1 on first render", () => {
    const { result } = renderHook(() => useCompare([1, 2, 3]));
    expect(result.current[0]).toBe(1);
  });

  it("should not increment version if input remains the same", () => {
    const { rerender, result } = renderHook(({ input }) => useCompare(input), {
      initialProps: { input: [1, 2, 3] },
    });
    expect(result.current[0]).toBe(1);

    rerender({ input: [1, 2, 3] });
    expect(result.current[0]).toBe(1);
  });

  it("should increment version when input changes", () => {
    const { rerender, result } = renderHook(({ input }) => useCompare(input), {
      initialProps: { input: [1] },
    });
    expect(result.current[0]).toBe(1);

    rerender({ input: [2] });
    expect(result.current[0]).toBe(2);
  });

  it("should not increment version when both prev and current input are undefined", () => {
    const { result } = renderHook(() => useCompare());
    expect(result.current[0]).toBe(0);
  });

  it("should increment version when input changes from undefined to array", () => {
    const { result } = renderHook(() => useCompare());
    expect(result.current[0]).toBe(0);

    const { result: result2 } = renderHook(() => useCompare([1, 2, 3]));
    expect(result2.current[0]).toBe(1);
  });

  it("should handle array length changes", () => {
    const { rerender, result } = renderHook(({ input }) => useCompare(input), {
      initialProps: { input: [1, 2] },
    });
    expect(result.current[0]).toBe(1);

    rerender({ input: [1, 2, 3] });
    expect(result.current[0]).toBe(2);
  });

  it("should handle array content changes", () => {
    const { rerender, result } = renderHook(({ input }) => useCompare(input), {
      initialProps: { input: [1, 2, 3] },
    });
    expect(result.current[0]).toBe(1);

    rerender({ input: [1, 2, 4] });
    expect(result.current[0]).toBe(2);
  });
});
