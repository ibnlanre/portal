import { describe, expectTypeOf, test } from "vitest";
import type { ParseAsNumber } from "./index";

type TestCases = {
  input: string | number;
  expected: string | number;
}[];

const testCases = [
  { input: "123", expected: 123 },
  { input: "456", expected: 456 },
  { input: "abc", expected: "abc" },
  { input: 789, expected: 789 },
  { input: "0", expected: 0 },
  { input: "", expected: "" },
] as const satisfies TestCases;

describe("ParseAsNumber", () => {
  test.each(testCases)("should parse %p as %p", ({ input, expected }) => {
    type Result = ParseAsNumber<typeof input>;
    type Expected = typeof expected;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
