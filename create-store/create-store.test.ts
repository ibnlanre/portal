import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";
import { createStore } from "./index";

vi.mock("@/create-store/functions/library/create-composite-store");
vi.mock("@/create-store/functions/library/create-primitive-store");

describe("createStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a primitive store when initial state is undefined", () => {
    createStore(undefined);
    expect(createPrimitiveStore).toHaveBeenCalledWith(undefined);
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a composite store when initial state is a dictionary", () => {
    const initialState = { key: "value" };
    createStore(initialState);
    expect(createCompositeStore).toHaveBeenCalledWith(initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });

  it("should create a primitive store when initial state is a primitive", () => {
    const initialState = "not a dictionary";
    createStore(initialState);
    expect(createPrimitiveStore).toHaveBeenCalledWith(initialState);
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should handle initial state as a function", () => {
    const initialState = vi.fn(() => ({ key: "value" }));
    createStore(initialState);
    expect(initialState).toHaveBeenCalled();
    expect(createCompositeStore).toHaveBeenCalledWith({ key: "value" });
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });

  it("should handle initial state as a promise", async () => {
    const originalFetch = global.fetch;
    Object.defineProperty(global, "fetch", {
      value: vi.fn(async () => ({
        json: vi.fn(async () => {
          return { completed: true };
        }),
      })),
      writable: true,
    });

    await createStore(async function () {
      const response = await fetch("https://example.com");
      const data = await response.json();
      return data;
    });

    expect(createPrimitiveStore).toHaveBeenCalledWith({ completed: true });
    expect(createCompositeStore).not.toHaveBeenCalled();
    global.fetch = originalFetch;
  });
});
