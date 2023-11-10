import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { createPortal, createBuilder } from "@/component";

describe("createPortal", () => {
  it("should return a function", () => {
    const store = createBuilder({ count: 0 });
    const usePortal = createPortal(store);
    expect(typeof usePortal).toBe("function");
  });

  it("should return the correct value for a given path", () => {
    const store = createBuilder({ count: 0 });
    const usePortal = createPortal(store);

    const { result } = renderHook(() => usePortal("count"));
    const [count, setCount] = result.current;
    expect(count).toBe(0);

    act(() => {
      setCount(1);
    });
    const [newCount] = result.current;
    expect(newCount).toBe(1);
  });

  it("should return the correct value for a nested path", () => {
    const store = createBuilder({ user: { name: "John", age: 30 } });
    const usePortal = createPortal(store);

    const { result } = renderHook(() => usePortal("user.name"));
    const [name, setName] = result.current;
    expect(name).toBe("John");

    act(() => {
      setName("Jane");
    });
    const [newName] = result.current;
    expect(newName).toBe("Jane");
  });
});
