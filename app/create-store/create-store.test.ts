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

  it("should create a primitive store when schema has a primitive default", () => {
    const schema = z.undefined();
    createStore(schema);
    expect(createPrimitiveStore).toHaveBeenCalledWith(schema, undefined);
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a composite store when schema has a dictionary default", () => {
    const initialState = { key: "value" };
    const schema = z.object({ key: z.string().default("value") });
    createStore(schema);
    expect(createCompositeStore).toHaveBeenCalledWith(schema, initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });

  it("should create a primitive store when schema has a string default", () => {
    const schema = z.string().default("not a dictionary");
    createStore(schema);
    expect(createPrimitiveStore).toHaveBeenCalledWith(
      schema,
      "not a dictionary"
    );
    expect(createCompositeStore).not.toHaveBeenCalled();
  });

  it("should create a composite store when schema is detected as an object schema", () => {
    const initialState = { key: "value" };
    const schema = z.object({ key: z.string().default("value") });
    createStore(schema);
    expect(createCompositeStore).toHaveBeenCalledWith(schema, initialState);
    expect(createPrimitiveStore).not.toHaveBeenCalled();
  });
});
