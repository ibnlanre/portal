import { describe, expect, it } from "vitest";

import { isPrimitive } from "./index";

describe("isPrimitive", () => {
  it("returns true for null", () => {
    expect(isPrimitive(null)).toBe(true);
  });

  it("returns true for undefined", () => {
    expect(isPrimitive(undefined)).toBe(true);
  });

  it("returns true for boolean values", () => {
    expect(isPrimitive(true)).toBe(true);
    expect(isPrimitive(false)).toBe(true);
  });

  it("returns true for numbers", () => {
    expect(isPrimitive(0)).toBe(true);
    expect(isPrimitive(42)).toBe(true);
    expect(isPrimitive(NaN)).toBe(true);
    expect(isPrimitive(Infinity)).toBe(true);
  });

  it("returns true for strings", () => {
    expect(isPrimitive("")).toBe(true);
    expect(isPrimitive("hello")).toBe(true);
  });

  it("returns true for symbols", () => {
    expect(isPrimitive(Symbol())).toBe(true);
    expect(isPrimitive(Symbol("desc"))).toBe(true);
  });

  it("returns true for bigint", () => {
    expect(isPrimitive(BigInt(1))).toBe(true);
    expect(isPrimitive(0n)).toBe(true);
  });

  it("returns false for objects", () => {
    expect(isPrimitive({})).toBe(false);
    expect(isPrimitive({ a: 1 })).toBe(false);
    expect(isPrimitive([])).toBe(false);
    expect(isPrimitive(new Date())).toBe(false);
    expect(isPrimitive(/regex/)).toBe(false);
  });

  it("returns false for functions", () => {
    expect(isPrimitive(function () {})).toBe(false);
    expect(isPrimitive(() => {})).toBe(false);
    expect(isPrimitive(class {})).toBe(false);
  });
});
