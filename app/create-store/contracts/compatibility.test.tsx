import type { PropsWithChildren } from "react";

import { renderHook } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { composite } from "../functions/library/composite";
import { contextStore } from "../functions/library/context-store";
import { primitive } from "../functions/library/primitive";

describe("React compatibility contract", () => {
  it("declares React 19 as the minimum supported major for the context API", () => {
    const pkg = JSON.parse(
      readFileSync(`${process.cwd()}/package.json`, "utf8")
    );
    for (const dependency of ["react", "react-dom"]) {
      expect(pkg.peerDependencies[dependency]).toBe("^19.0.0");
    }
  });
  it("supports React 19 context with an explicitly instance-stable factory", () => {
    const [Provider, useStore] = contextStore((value: number) => {
      const [store] = useState(() => primitive(value));
      return store;
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider value={1}>{children}</Provider>
    );
    const hook = renderHook(() => useStore(), { wrapper });
    const store = hook.result.current;
    hook.rerender();
    expect(hook.result.current).toBe(store);
    expect(store.$get()).toBe(1);
  });
});
