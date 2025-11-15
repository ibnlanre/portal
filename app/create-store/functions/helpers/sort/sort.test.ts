import { describe, expect, it } from "vitest";

import { sort } from "./index";

describe("sort", () => {
  it("sorts an array of strings lexicographically", () => {
    const arr = ["banana", "apple", "orange", "grape", "pear"];
    sort(arr);
    expect(arr).toEqual(["apple", "banana", "grape", "orange", "pear"]);
  });

  it("handles an already sorted array", () => {
    const arr = ["a", "b", "c", "d"];
    sort(arr);
    expect(arr).toEqual(["a", "b", "c", "d"]);
  });

  it("handles an array with duplicate strings", () => {
    const arr = ["dog", "cat", "dog", "bird", "cat"];
    sort(arr);
    expect(arr).toEqual(["bird", "cat", "cat", "dog", "dog"]);
  });

  it("handles an array with empty strings", () => {
    const arr = ["", "a", "", "b", ""];
    sort(arr);
    expect(arr).toEqual(["", "", "", "a", "b"]);
  });

  it("handles an array with single character strings", () => {
    const arr = ["z", "x", "a", "m", "b"];
    sort(arr);
    expect(arr).toEqual(["a", "b", "m", "x", "z"]);
  });

  it("handles an array with mixed length strings", () => {
    const arr = ["abc", "ab", "abcd", "a", "b"];
    sort(arr);
    expect(arr).toEqual(["a", "ab", "abc", "abcd", "b"]);
  });

  it("handles an empty array", () => {
    const arr: string[] = [];
    sort(arr);
    expect(arr).toEqual([]);
  });

  it("handles an array with one element", () => {
    const arr = ["single"];
    sort(arr);
    expect(arr).toEqual(["single"]);
  });

  it("sorts unicode strings correctly", () => {
    const arr = ["éclair", "apple", "Éclair", "banana"];
    sort(arr);
    expect(arr).toEqual(["apple", "banana", "Éclair", "éclair"]);
  });
});
