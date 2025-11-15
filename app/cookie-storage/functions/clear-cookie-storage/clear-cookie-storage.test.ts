import { describe, expect, it, vi } from "vitest";

import { removeCookieValue } from "@/cookie-storage/functions/remove-cookie-value";

import { clearCookieStorage } from "./index";

vi.mock("@/cookie-storage/functions/remove-cookie-value");

describe("clearCookieStorage", () => {
  it("should clear all cookies", () => {
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "cookie1=value1; cookie2=value2; cookie3=value3",
      writable: true,
    });

    clearCookieStorage();

    expect(removeCookieValue).toHaveBeenCalledTimes(3);
    expect(removeCookieValue).toHaveBeenCalledWith("cookie1");
    expect(removeCookieValue).toHaveBeenCalledWith("cookie2");
    expect(removeCookieValue).toHaveBeenCalledWith("cookie3");
  });

  it("should not throw an error if document is undefined", () => {
    const originalDocument = global.document;

    Object.defineProperty(global, "document", {
      value: undefined,
      writable: true,
    });

    expect(() => clearCookieStorage()).not.toThrow();
    global.document = originalDocument;
  });

  it("should handle errors gracefully", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    Object.defineProperty(document, "cookie", {
      get() {
        throw new Error("Test error");
      },
    });

    clearCookieStorage();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error occurred while clearing cookieStorage:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
