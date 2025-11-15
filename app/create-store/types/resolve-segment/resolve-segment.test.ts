import type { ResolveSegment } from "./index";

import { describe, expectTypeOf, it } from "vitest";

describe("ResolveSegment", () => {
  it("should resolve the correct type for a nested dictionary", () => {
    type Result = ResolveSegment<{ a: { b: { c: string } } }, ["a", "b", "c"]>;
    type Expected = string;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should resolve the correct type for an optional nested dictionary", () => {
    type Result = ResolveSegment<{ a: { b?: { c: string } } }, ["a", "b"]>;
    type Expected = undefined | { c: string };
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should resolve the correct type for a top-level optional dictionary", () => {
    type Result = ResolveSegment<{ a?: { b: { c: string } } }, ["a"]>;
    type Expected = undefined | { b: { c: string } };
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should resolve the correct type for a dictionary with numeric keys", () => {
    type Result = ResolveSegment<{ a: { 42: { c: string } } }, ["a", 42, "c"]>;
    type Expected = string;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
