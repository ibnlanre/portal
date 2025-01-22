import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";
import { createStore } from "../index";

vi.mock("@/create-store/functions/library/create-composite-store");
vi.mock("@/create-store/functions/library/create-primitive-store");

describe("Smoke test for createPrimitiveStore and createCompositeStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a primitive store when initial state is undefined", () => {
    createStore();
    expect(createPrimitiveStore).toHaveBeenCalled();
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a composite store when initial state is a dictionary", () => {
    const initialState = { key: "value" };

    createStore(initialState);
    expect(createCompositeStore).toHaveBeenCalledWith(initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });

  it("should create a primitive store when initial state is not a dictionary", () => {
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
  });
});
