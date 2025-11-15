import { describe, expect, it, vi } from "vitest";

import { getCookieStorageLength } from "./index";

describe("getCookieStorageLength", () => {
  it("should return 0 if document is undefined", () => {
    const originalDocument = global.document;

    Object.defineProperty(global, "document", {
      configurable: true,
      value: undefined,
      writable: true,
    });

    expect(() => getCookieStorageLength()).not.toThrow();
    expect(getCookieStorageLength()).toBe(0);

    global.document = originalDocument;
  });

  it("should return 0 if there are no cookies", () => {
    vi.spyOn(document, "cookie", "get").mockReturnValue("");
    expect(getCookieStorageLength()).toBe(0);
  });

  it("should return the correct number of cookies", () => {
    vi.spyOn(document, "cookie", "get").mockReturnValue(
      "cookie1=value1; cookie2=value2; cookie3=value3"
    );

    expect(getCookieStorageLength()).toBe(3);
  });

  it("should handle cookies with extra spaces correctly", () => {
    vi.spyOn(document, "cookie", "get").mockReturnValue(
      "cookie1=value1;  ; cookie2=value2; ; cookie3=value3"
    );

    expect(getCookieStorageLength()).toBe(3);
  });

  it("should return zero if an error occurs", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    Object.defineProperty(document, "cookie", {
      get() {
        throw new Error("Test error");
      },
    });

    expect(getCookieStorageLength()).toBe(0);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error occurred while getting cookieStorage length:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
