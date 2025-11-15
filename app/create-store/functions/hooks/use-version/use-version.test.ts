import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useVersion } from "./index";

describe("useVersion", () => {
  it("should initialize version to 1 on first render", () => {
    const { result } = renderHook(() => useVersion([1, 2, 3]));
    expect(result.current).toBe(1);
  });

  it("should not increment version if input remains the same", () => {
    const { rerender, result } = renderHook(({ input }) => useVersion(input), {
      initialProps: { input: [1, 2, 3] },
    });
    expect(result.current).toBe(1);

    rerender({ input: [1, 2, 3] });
    expect(result.current).toBe(1);
  });

  it("should increment version when input changes", () => {
    const { rerender, result } = renderHook(({ input }) => useVersion(input), {
      initialProps: { input: [1] },
    });
    expect(result.current).toBe(1);

    rerender({ input: [2] });
    expect(result.current).toBe(2);
  });

  it("should not increment version when both prev and current input are undefined", () => {
    const { result } = renderHook(() => useVersion());
    expect(result.current).toBe(0);
  });

  it("should increment version when input changes from undefined to array", () => {
    const { result } = renderHook(() => useVersion());
    expect(result.current).toBe(0);

    const { result: result2 } = renderHook(() => useVersion([1, 2, 3]));
    expect(result2.current).toBe(1);
  });

  it("should handle array length changes", () => {
    const { rerender, result } = renderHook(({ input }) => useVersion(input), {
      initialProps: { input: [1, 2] },
    });
    expect(result.current).toBe(1);

    rerender({ input: [1, 2, 3] });
    expect(result.current).toBe(2);
  });

  it("should handle array content changes", () => {
    const { rerender, result } = renderHook(({ input }) => useVersion(input), {
      initialProps: { input: [1, 2, 3] },
    });
    expect(result.current).toBe(1);

    rerender({ input: [1, 2, 4] });
    expect(result.current).toBe(2);
  });
});
