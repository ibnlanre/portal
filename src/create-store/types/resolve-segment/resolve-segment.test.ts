import { describe, it, expectTypeOf } from "vitest";
import type { ResolveSegment } from ".";

describe("ResolveSegment", () => {
  it("should resolve the correct type for a nested dictionary", () => {
    type Result = ResolveSegment<{ a: { b: { c: string } } }, ["a", "b", "c"]>;
    type Expected = string;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should resolve the correct type for an optional nested dictionary", () => {
    type Result = ResolveSegment<{ a: { b?: { c: string } } }, ["a", "b"]>;
    type Expected = { c: string } | undefined;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should resolve the correct type for a top-level optional dictionary", () => {
    type Result = ResolveSegment<{ a?: { b: { c: string } } }, ["a"]>;
    type Expected = { b: { c: string } } | undefined;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });

  it("should resolve the correct type for a dictionary with numeric keys", () => {
    type Result = ResolveSegment<{ a: { 42: { c: string } } }, ["a", 42, "c"]>;
    type Expected = string;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
