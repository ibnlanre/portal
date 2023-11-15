import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { makeUsePortal } from "@/component";

describe("makeUsePortal", () => {
  it("should return a function", () => {
    const usePortal = makeUsePortal({ count: 0 });
    expect(typeof usePortal).toBe("function");
  });

  it("should return the correct value for a given path", () => {
    const usePortal = makeUsePortal({ count: 0 });

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
    const store = { user: { name: "John", age: 30 } };
    const usePortal = makeUsePortal(store);

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
