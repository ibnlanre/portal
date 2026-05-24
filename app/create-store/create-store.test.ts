import type { StandardSchema } from "@/create-store/types/schema";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";

import { createStore } from "./index";

vi.mock("@/create-store/functions/library/create-composite-store");
vi.mock("@/create-store/functions/library/create-primitive-store");

function schema<T>(
  defaultValue: T,
  isObject = false
): StandardSchema<unknown, T> {
  return {
    "~standard": {
      vendor: "test",
      version: 1,
      ...(isObject ? { shape: defaultValue } : {}),
      types: { input: undefined as unknown, output: defaultValue },
      validate(value: unknown) {
        if (value === undefined) {
          return { value: defaultValue };
        }
        if (isObject && typeof value === "object" && value !== null) {
          return { value: defaultValue };
        }
        if (!isObject && typeof value === "object" && value !== null) {
          return { issues: [{ message: "expected a primitive, got object" }] };
        }
        return { value: value as T };
      },
    },
  } as StandardSchema<unknown, T>;
}

describe("createStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a primitive store when schema has a primitive default", () => {
    createStore(schema(undefined));
    expect(createPrimitiveStore).toHaveBeenCalledWith(undefined);
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a composite store when schema has a dictionary default", () => {
    const initialState = { key: "value" };
    createStore(schema(initialState, true));
    expect(createCompositeStore).toHaveBeenCalledWith(initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });

  it("should create a primitive store when schema has a string default", () => {
    createStore(schema("not a dictionary"));
    expect(createPrimitiveStore).toHaveBeenCalledWith("not a dictionary");
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a composite store when schema is detected as an object schema", () => {
    const initialState = { key: "value" };
    createStore(schema(initialState, true));
    expect(createCompositeStore).toHaveBeenCalledWith(initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });
});
