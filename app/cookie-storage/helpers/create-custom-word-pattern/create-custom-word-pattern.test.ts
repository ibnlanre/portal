import { describe, expect, it } from "vitest";

import { createCustomWordPattern } from "./index";

describe("createCustomWordPattern", () => {
  it("should return the original word if length is greater than or equal to word length", () => {
    expect(createCustomWordPattern("hello", 5)).toBe("hello");
    expect(createCustomWordPattern("hello", 6)).toBe("hello");
  });

  it("should return the first character if length is 1", () => {
    expect(createCustomWordPattern("hello", 1)).toBe("h");
  });

  it("should expand the word to the specified length", () => {
    expect(createCustomWordPattern("hello", 2)).toBe("hl");
    expect(createCustomWordPattern("world", 3)).toBe("wrd");
    expect(createCustomWordPattern("example", 4)).toBe("exml");
  });

  it("should return the correct pattern for different lengths", () => {
    expect(createCustomWordPattern("little", 1)).toBe("l");
    expect(createCustomWordPattern("little", 2)).toBe("lt");
    expect(createCustomWordPattern("little", 3)).toBe("ltl");
    expect(createCustomWordPattern("little", 4)).toBe("lttl");
    expect(createCustomWordPattern("little", 5)).toBe("lttle");
  });

  it("should handle words starting with vowels correctly", () => {
    expect(createCustomWordPattern("apple", 1)).toBe("a");
    expect(createCustomWordPattern("apple", 2)).toBe("ap");
    expect(createCustomWordPattern("apple", 3)).toBe("apl");
    expect(createCustomWordPattern("apple", 4)).toBe("appl");
    expect(createCustomWordPattern("apple", 5)).toBe("apple");
  });

  it("should handle words with no consonants correctly", () => {
    expect(createCustomWordPattern("aeiou", 1)).toBe("a");
    expect(createCustomWordPattern("aeiou", 2)).toBe("au");
    expect(createCustomWordPattern("aeiou", 3)).toBe("aiu");
    expect(createCustomWordPattern("aeiou", 4)).toBe("aeiu");
    expect(createCustomWordPattern("aeiou", 5)).toBe("aeiou");
  });

  it("should handle words with no vowels correctly", () => {
    expect(createCustomWordPattern("bcdfgh", 4)).toBe("bdgh");
    expect(createCustomWordPattern("rhythm", 1)).toBe("r");
    expect(createCustomWordPattern("rhythm", 2)).toBe("ry");
    expect(createCustomWordPattern("rhythm", 3)).toBe("ryh");
    expect(createCustomWordPattern("rhythm", 4)).toBe("ryhm");
    expect(createCustomWordPattern("rhythm", 5)).toBe("rhyhm");
    expect(createCustomWordPattern("rhythm", 6)).toBe("rhythm");
  });

  it("should handle edge cases with short lengths", () => {
    expect(createCustomWordPattern("xyz", 2)).toBe("xz");
  });

  it("should handle longer words and lengths", () => {
    expect(createCustomWordPattern("abcdefgh", 5)).toBe("abdfh");
    expect(createCustomWordPattern("programming", 6)).toBe("prgmng");
  });

  it("should work correctly with repeated characters", () => {
    expect(createCustomWordPattern("aabbcc", 1)).toBe("a");
    expect(createCustomWordPattern("aabbcc", 4)).toBe("abcc");
    expect(createCustomWordPattern("aabbcc", 5)).toBe("abbcc");
  });

  it("should prioritize consonants", () => {
    expect(createCustomWordPattern("alphabet", 5)).toBe("alhbt");
    expect(createCustomWordPattern("abcde", 3)).toBe("abd");
    expect(createCustomWordPattern("xyzabc", 4)).toBe("xzbc");
    expect(createCustomWordPattern("rtkpoe", 3)).toBe("rtk");
    expect(createCustomWordPattern("mnkaei", 4)).toBe("mnki");
  });

  it("should handle empty string correctly", () => {
    expect(createCustomWordPattern("", 1)).toBe("");
    expect(createCustomWordPattern("", 0)).toBe("");
  });

  it("should throw an error if length is negative", () => {
    expect(() => createCustomWordPattern("hello", -1)).toThrowError(
      "Length must be a positive number"
    );
  });
});
