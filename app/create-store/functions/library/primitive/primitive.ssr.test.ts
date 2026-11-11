import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { primitive } from "./index";

describe("primitive on the server", () => {
  it("creates, reads, writes, subscribes and selects without a window", () => {
    expect(typeof window).toBe("undefined");
    const store = primitive({ a: 1, b: 2 });
    const listener = vi.fn();
    store.$subscribe(listener, { immediate: false });
    store.$set({ a: 3, b: 2 });
    expect(store.$get()).toEqual({ a: 3, b: 2 });
    expect(store.$get((state) => state.a)).toBe(3);
    expect(listener).toHaveBeenCalledTimes(1);
    store.$reset();
    store.$dispose();
  });

  it("renders $use to a string with the current value", () => {
    const store = primitive("hello");
    function Greeting() {
      const [value] = store.$use();
      return createElement("p", null, value);
    }
    expect(renderToString(createElement(Greeting))).toContain("hello");
  });
});
