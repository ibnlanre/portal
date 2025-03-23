import { describe, expect, it } from "vitest";
import { createPathComponents } from "./index";

describe("createPathComponents", () => {
  it("should return components for a single segment path", () => {
    const path = "segment";
    const result = createPathComponents(path);
    expect(result).toEqual(["segment"]);
  });

  it("should return components for a multi-segment path", () => {
    const path = "segment1.segment2.segment3";
    const result = createPathComponents(path);
    expect(result).toEqual([
      "segment1",
      "segment1.segment2",
      "segment1.segment2.segment3",
    ]);
  });

  it("should return an empty array for an empty string path", () => {
    const path = "";
    const result = createPathComponents(path);
    expect(result).toEqual([]);
  });

  it("should handle paths with trailing dots correctly", () => {
    const path = "segment1.segment2.";
    const result = createPathComponents(path);
    expect(result).toEqual([
      "segment1",
      "segment1.segment2",
      "segment1.segment2.",
    ]);
  });

  it("should handle paths with leading dots correctly", () => {
    const path = ".segment1.segment2";
    const result = createPathComponents(path);
    expect(result).toEqual(["", ".segment1", ".segment1.segment2"]);
  });

  it("should handle paths with consecutive dots correctly", () => {
    const path = "segment1..segment2";
    const result = createPathComponents(path);
    expect(result).toEqual(["segment1", "segment1.", "segment1..segment2"]);
  });

  it("should handle undefined paths correctly", () => {
    const result = createPathComponents();
    expect(result).toEqual([]);
  });
});
