import { describe, expect, it } from "vitest";
import { transformCase } from "./index";

describe("transformCase", () => {
  it("should transform to title case", () => {
    expect(transformCase("hello world", "title")).toBe("Hello World");
    expect(transformCase("HELLO WORLD", "title")).toBe("HELLO WORLD");
    expect(transformCase("hello world!", "title")).toBe("Hello World!");
  });

  it("should transform to upper case", () => {
    expect(transformCase("hello world", "upper")).toBe("HELLO WORLD");
    expect(transformCase("HELLO WORLD", "upper")).toBe("HELLO WORLD");
    expect(transformCase("hello world!", "upper")).toBe("HELLO WORLD!");
  });

  it("should transform to camel case", () => {
    expect(transformCase("hello world", "camel")).toBe("helloWorld");
    expect(transformCase("hello-world", "camel")).toBe("helloWorld");
    expect(transformCase("hello_world", "camel")).toBe("helloWorld");
    expect(transformCase("hello_world!", "camel")).toBe("helloWorld!");
  });

  it("should transform to pascal case", () => {
    expect(transformCase("hello world", "pascal")).toBe("Hello World");
    expect(transformCase("hello-world", "pascal")).toBe("Hello-World");
    expect(transformCase("hello_world", "pascal")).toBe("Hello_World");
    expect(transformCase("hello_world!", "pascal")).toBe("Hello_World!");
  });

  it("should transform to lower case", () => {
    expect(transformCase("HELLO WORLD", "lower")).toBe("hello world");
    expect(transformCase("hello world", "lower")).toBe("hello world");
    expect(transformCase("Hello World!", "lower")).toBe("hello world!");
  });

  it("should transform to lower case by default", () => {
    // @ts-expect-error
    expect(transformCase("HELLO WORLD", "unknown")).toBe("hello world");
  });
});
