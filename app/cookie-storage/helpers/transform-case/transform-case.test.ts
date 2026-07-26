import type { CaseType } from "@/cookie-storage/types/case-type";

import { describe, expect, it } from "vitest";

import { transformCase } from "./index";

const transformCases = <
  Array<{
    caseType: CaseType;
    testCases: Array<{ expected: string; input: string }>;
  }>
>[
  {
    caseType: "title",
    testCases: [
      { expected: "Hello World", input: "hello world" },
      { expected: "Hello World!", input: "hello world!" },
      { expected: "HELLO WORLD", input: "HELLO WORLD" },
    ],
  },
  {
    caseType: "upper",
    testCases: [
      { expected: "HELLO WORLD", input: "hello world" },
      { expected: "HELLO WORLD!", input: "hello world!" },
      { expected: "HELLO WORLD", input: "HELLO WORLD" },
    ],
  },
  {
    caseType: "camel",
    testCases: [
      { expected: "helloWorld", input: "hello world" },
      { expected: "helloWorld", input: "hello-world" },
      { expected: "helloWorld", input: "hello_world" },
      { expected: "helloWorld!", input: "hello_world!" },
      { expected: "helloWorld", input: "HELLO WORLD" },
    ],
  },
  {
    caseType: "pascal",
    testCases: [
      { expected: "HelloWorld", input: "hello world" },
      { expected: "HelloWorld", input: "hello-world" },
      { expected: "HelloWorld", input: "hello_world" },
      { expected: "HelloWorld!", input: "hello_world!" },
      { expected: "HelloWorld", input: "HELLO WORLD" },
    ],
  },
  {
    caseType: "lower",
    testCases: [
      { expected: "hello world", input: "hello world" },
      { expected: "hello world!", input: "Hello World!" },
      { expected: "hello world", input: "HELLO WORLD" },
    ],
  },
  {
    caseType: "sentence",
    testCases: [
      { expected: "Hello world", input: "hello world" },
      { expected: "Hello world", input: "HELLO WORLD" },
    ],
  },
  {
    caseType: "kebab",
    testCases: [
      { expected: "hello-world", input: "hello world" },
      { expected: "hello-world", input: "hello_world" },
      { expected: "hello-world", input: "Hello World" },
    ],
  },
];

describe("transformCase", () => {
  describe.each(transformCases)("$caseType case", ({ caseType, testCases }) => {
    it.each(testCases)(
      "transforms '$input' to '$expected'",
      ({ expected, input }) => {
        expect(transformCase(input, caseType)).toBe(expected);
      }
    );
  });

  it("should transform to lower case by default for unknown case types", () => {
    expect(transformCase("HELLO WORLD")).toBe("hello world");
  });
});
