import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useDebouncedShallowEffect } from "@/atom";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedShallowEffect", () => {
  it("should call the effect function after the delay", async () => {
    const effect = vi.fn();

    renderHook(() =>
      useDebouncedShallowEffect(effect, [], {
        delay: 1000,
      })
    );
    expect(effect).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(effect).toHaveBeenCalled();
  });

  it("should invoke the effect function when dependencies change", () => {
    const effect = vi.fn();

    const { rerender } = renderHook(
      (props) => useDebouncedShallowEffect(effect, props.dependencies),
      {
        initialProps: {
          dependencies: [] as number[],
        },
      }
    );

    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ dependencies: [1, 2, 3] });
    rerender({ dependencies: [1, 2, 3] });
    rerender({ dependencies: [1, 2, 3] });

    expect(effect).toHaveBeenCalledTimes(2);

    rerender({ dependencies: [4, 5, 6] });
    rerender({ dependencies: [4, 5, 6] });

    expect(effect).toHaveBeenCalledTimes(3);
  });

  it("should debounce the effect function with the specified delay", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(
      (props) =>
        useDebouncedShallowEffect(effect, props.dependencies, {
          delay: 500,
        }),
      {
        initialProps: {
          dependencies: [] as number[],
        },
      }
    );

    expect(effect).not.toHaveBeenCalled();

    rerender({ dependencies: [1, 2, 3] });
    rerender({ dependencies: [1, 2, 3] });

    vi.advanceTimersByTime(500);
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ dependencies: [4, 5, 6] });
    vi.advanceTimersByTime(500);
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
