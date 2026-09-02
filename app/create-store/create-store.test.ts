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

  it("should create a primitive store for an undefined initial state", () => {
    createStore(undefined);
    expect(createPrimitiveStore).toHaveBeenCalledWith(undefined);
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a primitive store for a string initial state", () => {
    createStore("not a dictionary");
    expect(createPrimitiveStore).toHaveBeenCalledWith("not a dictionary");
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a primitive store for a number initial state", () => {
    createStore(0);
    expect(createPrimitiveStore).toHaveBeenCalledWith(0);
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a composite store for an object initial state", () => {
    const initialState = { key: "value" };
    createStore(initialState);
    expect(createCompositeStore).toHaveBeenCalledWith(initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });

  it("should create a composite store for a nested object initial state", () => {
    const initialState = { user: { age: 30, name: "Alice" } };
    createStore(initialState);
    expect(createCompositeStore).toHaveBeenCalledWith(initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });

  it("should dispatch exactly once to the composite store", () => {
    const initialState = { count: 99 };
    createStore(initialState);
    expect(createCompositeStore).toHaveBeenCalledWith(initialState);
    expect(createCompositeStore).toHaveBeenCalledTimes(1);
  });
});
