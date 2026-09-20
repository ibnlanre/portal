import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAsync, useSync, useVersion } from "../../index";

describe("dependency identity and order", () => {
  it("compares dependency positions with Object.is", () => {
    const object = { value: 1 };
    const callback = () => 1;
    const { rerender, result } = renderHook(({ deps }) => useVersion(deps), {
      initialProps: { deps: [object, callback, 1, 2] as unknown[] },
    });
    const initial = result.current;
    rerender({ deps: [object, callback, 1, 2] });
    expect(result.current).toBe(initial);
    rerender({ deps: [object, callback, 2, 1] });
    expect(result.current).toBe(initial + 1);
    rerender({ deps: [{ value: 1 }, callback, 2, 1] });
    expect(result.current).toBe(initial + 2);
  });

  it("recomputes synchronous values for reordered dependencies", () => {
    const { rerender, result } = renderHook(
      ({ values }) => useSync(() => values.join("-"), values),
      {
        initialProps: { values: [1, 2] },
      }
    );
    expect(result.current).toBe("1-2");
    rerender({ values: [2, 1] });
    expect(result.current).toBe("2-1");
  });

  it("distinguishes closures with identical source and different captured values", () => {
    const make = (value: number) => () => value;
    const { rerender, result } = renderHook(
      ({ callback }) => useSync(callback, [callback]),
      {
        initialProps: { callback: make(1) },
      }
    );
    expect(result.current).toBe(1);
    rerender({ callback: make(2) });
    expect(result.current).toBe(2);
  });

  it("restarts async work when a callback dependency is replaced", async () => {
    const make = (value: number) => async () => value;
    const { rerender, result } = renderHook(
      ({ callback }) => useAsync(callback, [callback]),
      {
        initialProps: { callback: make(1) },
      }
    );
    await waitFor(() => expect(result.current.data).toBe(1));
    rerender({ callback: make(2) });
    await waitFor(() => expect(result.current.data).toBe(2));
  });
});
