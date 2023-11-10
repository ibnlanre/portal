import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useDebouncedShallowEffect } from "@/utilities";

describe("useDebouncedShallowEffect", () => {
  it("should call the effect function after the delay", async () => {
    const effect = vi.fn();
    const delay = 1000;

    renderHook(() => useDebouncedShallowEffect(effect, [], delay));

    expect(effect).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, delay));

    expect(effect).toHaveBeenCalled();
  });

  it("should debounce the effect function", async () => {
    const effect = vi.fn();
    const delay = 1000;

    const { rerender } = renderHook(
      ({ dependencies }) =>
        useDebouncedShallowEffect(effect, dependencies, delay),
      { initialProps: { dependencies: [1] } }
    );

    expect(effect).not.toHaveBeenCalled();

    rerender({ dependencies: [2] });

    expect(effect).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, delay));

    expect(effect).toHaveBeenCalled();
  });

  it("should compare dependencies shallowly", async () => {
    const effect = vi.fn();
    const delay = 1000;

    const { rerender } = renderHook(
      ({ dependencies }) =>
        useDebouncedShallowEffect(effect, dependencies, delay),
      { initialProps: { dependencies: [1] } }
    );

    expect(effect).not.toHaveBeenCalled();

    rerender({ dependencies: [1] });

    expect(effect).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, delay));

    expect(effect).toHaveBeenCalled();
  });
});
