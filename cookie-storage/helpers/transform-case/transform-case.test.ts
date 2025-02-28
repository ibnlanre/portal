import type { CaseType } from "@/cookie-storage/types/case-type";

import { describe, expect, it } from "vitest";
import { transformCase } from "./index";

const transformCases = <
  Array<{
    caseType: CaseType;
    testCases: Array<{ input: string; expected: string }>;
  }>
>[
  {
    caseType: "title",
    testCases: [
      { input: "hello world", expected: "Hello World" },
      { input: "hello world!", expected: "Hello World!" },
      { input: "HELLO WORLD", expected: "HELLO WORLD" },
    ],
  },
  {
    caseType: "upper",
    testCases: [
      { input: "hello world", expected: "HELLO WORLD" },
      { input: "hello world!", expected: "HELLO WORLD!" },
      { input: "HELLO WORLD", expected: "HELLO WORLD" },
    ],
  },
  {
    caseType: "camel",
    testCases: [
      { input: "hello world", expected: "helloWorld" },
      { input: "hello-world", expected: "helloWorld" },
      { input: "hello_world", expected: "helloWorld" },
      { input: "hello_world!", expected: "helloWorld!" },
      { input: "HELLO WORLD", expected: "helloWorld" },
    ],
  },
  {
    caseType: "pascal",
    testCases: [
      { input: "hello world", expected: "HelloWorld" },
      { input: "hello-world", expected: "HelloWorld" },
      { input: "hello_world", expected: "HelloWorld" },
      { input: "hello_world!", expected: "HelloWorld!" },
      { input: "HELLO WORLD", expected: "HelloWorld" },
    ],
  },
  {
    caseType: "lower",
    testCases: [
      { input: "hello world", expected: "hello world" },
      { input: "Hello World!", expected: "hello world!" },
      { input: "HELLO WORLD", expected: "hello world" },
    ],
  },
  {
    caseType: "sentence",
    testCases: [
      { input: "hello world", expected: "Hello world" },
      { input: "HELLO WORLD", expected: "Hello world" },
    ],
  },
  {
    caseType: "kebab",
    testCases: [
      { input: "hello world", expected: "hello-world" },
      { input: "hello_world", expected: "hello-world" },
      { input: "Hello World", expected: "hello-world" },
    ],
  },
];

describe("transformCase", () => {
  describe.each(transformCases)("$caseType case", ({ caseType, testCases }) => {
    it.each(testCases)(
      "transforms '$input' to '$expected'",
      ({ input, expected }) => {
        expect(transformCase(input, caseType)).toBe(expected);
      }
    );
  });

  it("should transform to lower case by default for unknown case types", () => {
    expect(transformCase("HELLO WORLD")).toBe("hello world");
  });
});
