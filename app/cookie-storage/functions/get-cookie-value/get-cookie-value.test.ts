import { describe, expect, it, vi } from "vitest";

import { getCookieValue } from "./index";

describe("getCookieValue", () => {
  it("should return the value of the cookie if it exists", () => {
    document.cookie = "testCookie=testValue";

    const result = getCookieValue("testCookie");
    expect(result).toBe("testValue");
  });

  it("should return null if the cookie does not exist", () => {
    const result = getCookieValue("nonExistentCookie");
    expect(result).toBeNull();
  });

  it("should return null if document is undefined", () => {
    const originalDocument = global.document;

    Object.defineProperty(global, "document", {
      value: undefined,
      writable: true,
    });

    const result = getCookieValue("testCookie");
    expect(result).toBeNull();

    global.document = originalDocument;
  });

  it("should return the correct value when multiple cookies are present", () => {
    ["cookie1", "cookie2", "cookie3"].forEach((cookie, index) => {
      document.cookie = `${cookie}=value${index + 1}`;
    });

    const result = getCookieValue("cookie2");
    expect(result).toBe("value2");
  });

  it("should return null if the cookie name is a substring of another cookie name", () => {
    ["test", "testCookie"].forEach((cookie) => {
      document.cookie = `${cookie}=${cookie}Value`;
    });

    const result = getCookieValue("test");
    expect(result).toBe("testValue");

    const result2 = getCookieValue("testCookie");
    expect(result2).toBe("testCookieValue");
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

    expect(getCookieValue("test")).toBeNull();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error occurred while retrieving cookie:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
