import { describe, expect, it } from "vitest";
import { getCookieValueByRegex } from ".";

describe("getCookieValueByRegex", () => {
  it("should return the value of the specified cookie", () => {
    Object.defineProperty(document, "cookie", {
      value: "testCookie=testValue",
      writable: true,
    });

    const result = getCookieValueByRegex("testCookie");
    expect(result).toBe("testValue");
  });

  it("should return null if the cookie is not found", () => {
    Object.defineProperty(document, "cookie", {
      value: "anotherCookie=anotherValue",
      writable: true,
    });

    const result = getCookieValueByRegex("testCookie");
    expect(result).toBeNull();
  });

  it("should return null if document is undefined", () => {
    const originalDocument = global.document;

    Object.defineProperty(global, "document", {
      writable: true,
      value: undefined,
    });

    const result = getCookieValueByRegex("testCookie");
    expect(result).toBeNull();

    global.document = originalDocument;
  });

  it("should handle cookies with special characters in the name", () => {
    Object.defineProperty(document, "cookie", {
      value: "special*Cookie=specialValue",
      writable: true,
    });

    const result = getCookieValueByRegex("special*Cookie");
    expect(result).toBe("specialValue");
  });

  it("should handle cookies with spaces around the equal sign", () => {
    Object.defineProperty(document, "cookie", {
      value: "spacedCookie = spacedValue",
      writable: true,
    });

    const result = getCookieValueByRegex("spacedCookie");
    expect(result).toBe("spacedValue");
  });

  it("should return null if there is an error in the regex", () => {
    const result = getCookieValueByRegex("invalid(regex");
    expect(result).toBeNull();
  });
});
