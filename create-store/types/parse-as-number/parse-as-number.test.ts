import type { ParseAsNumber } from "./index";

import { describe, expectTypeOf, test } from "vitest";

type TestCases = {
  expected: number | string;
  input: number | string;
}[];

const testCases = [
  { expected: 123, input: "123" },
  { expected: 456, input: "456" },
  { expected: "abc", input: "abc" },
  { expected: 789, input: 789 },
  { expected: 0, input: "0" },
  { expected: "", input: "" },
] as const satisfies TestCases;

describe("ParseAsNumber", () => {
  test.each(testCases)("should parse %p as %p", ({ expected, input }) => {
    type Result = ParseAsNumber<typeof input>;
    type Expected = typeof expected;
    expectTypeOf<Result>().toEqualTypeOf<Expected>();
  });
});
