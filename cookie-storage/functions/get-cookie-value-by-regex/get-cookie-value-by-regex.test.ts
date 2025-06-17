import { describe, expect, it, vi } from "vitest";

import { getCookieValueByRegex } from ".";

describe("getCookieValueByRegex", () => {
  it("should return the value of the specified cookie", () => {
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "testCookie=testValue",
      writable: true,
    });

    const result = getCookieValueByRegex("testCookie");
    expect(result).toBe("testValue");
  });

  it("should return null if the cookie is not found", () => {
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "anotherCookie=anotherValue",
      writable: true,
    });

    const result = getCookieValueByRegex("testCookie");
    expect(result).toBeNull();
  });

  it("should return null if document is undefined", () => {
    const originalDocument = global.document;

    Object.defineProperty(global, "document", {
      value: undefined,
      writable: true,
    });

    const result = getCookieValueByRegex("testCookie");
    expect(result).toBeNull();

    global.document = originalDocument;
  });

  it("should handle cookies with special characters in the name", () => {
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "special*Cookie=specialValue",
      writable: true,
    });

    const result = getCookieValueByRegex("special*Cookie");
    expect(result).toBe("specialValue");
  });

  it("should handle cookies with spaces around the equal sign", () => {
    Object.defineProperty(document, "cookie", {
      configurable: true,
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

  it("should return null if an error occurs", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    Object.defineProperty(document, "cookie", {
      get() {
        throw new Error("Test error");
      },
    });

    expect(getCookieValueByRegex("test")).toBeNull();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error occurred while retrieving cookie:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
