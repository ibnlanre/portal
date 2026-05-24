import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";

import { createStore } from "./index";

vi.mock("@/create-store/functions/library/create-composite-store");
vi.mock("@/create-store/functions/library/create-primitive-store");

describe("createStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a primitive store for an undefined schema", () => {
    const schema = z.undefined();
    createStore(schema, undefined);
    expect(createPrimitiveStore).toHaveBeenCalledWith(schema, undefined);
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a primitive store for a string schema", () => {
    const schema = z.string();
    createStore(schema, "not a dictionary");
    expect(createPrimitiveStore).toHaveBeenCalledWith(
      schema,
      "not a dictionary"
    );
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a primitive store for a number schema", () => {
    const schema = z.number();
    createStore(schema, 0);
    expect(createPrimitiveStore).toHaveBeenCalledWith(schema, 0);
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a composite store for an object schema", () => {
    const initialState = { key: "value" };
    const schema = z.object({ key: z.string() });
    createStore(schema, initialState);
    expect(createCompositeStore).toHaveBeenCalledWith(schema, initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });

  it("should create a composite store for a nested object schema", () => {
    const initialState = { user: { age: 30, name: "Alice" } };
    const schema = z.object({
      user: z.object({ age: z.number(), name: z.string() }),
    });
    createStore(schema, initialState);
    expect(createCompositeStore).toHaveBeenCalledWith(schema, initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });

  it("should pass initialState directly without schema resolution", () => {
    const initialState = { count: 99 };
    const schema = z.object({ count: z.number() });
    createStore(schema, initialState);
    expect(createCompositeStore).toHaveBeenCalledWith(schema, initialState);
    expect(createCompositeStore).toHaveBeenCalledTimes(1);
  });
});
