import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { composite } from "./index";

describe("composite on the server", () => {
  it("creates, reads, writes, subscribes and selects without a window", () => {
    const store = composite({ n: 1, user: composite({ name: "A" }) });
    const listener = vi.fn();
    store.$subscribe(listener, { immediate: false });
    store.$set({ n: 2, user: { name: "B" } });
    expect(store.$get()).toEqual({ n: 2, user: { name: "B" } });
    expect(store.$get((state) => state.user.name)).toBe("B");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("renders a branch's $use to a string", () => {
    const store = composite({ user: composite({ name: "Taylor" }) });
    function Name() {
      const [name] = store.user.name.$use();
      return createElement("span", null, name);
    }
    expect(renderToString(createElement(Name))).toContain("Taylor");
  });
});
