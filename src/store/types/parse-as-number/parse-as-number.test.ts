import { describe, expect, test } from "vitest";
import type { ParseAsNumber } from ".";

type TestCases = {
  input: string | number;
  expected: number | string;
};

const testCases: TestCases[] = [
  { input: "123", expected: 123 },
  { input: "456", expected: 456 },
  { input: "abc", expected: "abc" },
  { input: 789, expected: 789 },
  { input: "0", expected: 0 },
  { input: "", expected: "" },
];

describe("ParseAsNumber", () => {
  test.each(testCases)("should parse %p as %p", ({ input, expected }) => {
    type Result = ParseAsNumber<typeof input>;
    const result = <Result>input;
    expect(result).toBe(expected);
  });
});
