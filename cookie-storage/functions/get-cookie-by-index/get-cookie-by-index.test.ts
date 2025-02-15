import { describe, expect, it, vi } from "vitest";
import { getCookieByIndex } from "./index";

describe("getCookieByIndex", () => {
  it("should return null if document is undefined", () => {
    const originalDocument = global.document;

    Object.defineProperty(global, "document", {
      value: undefined,
      writable: true,
    });
    expect(getCookieByIndex(0)).toBeNull();

    global.document = originalDocument;
  });

  it("should return null if there are no cookies", () => {
    expect(getCookieByIndex(0)).toBeNull();
  });

  it("should return the cookie name at the specified index", () => {
    Object.defineProperty(document, "cookie", {
      value: "cookie1=value1; cookie2=value2; cookie3=value3",
      writable: true,
      configurable: true,
    });

    expect(getCookieByIndex(0)).toBe("cookie1");
    expect(getCookieByIndex(1)).toBe("cookie2");
    expect(getCookieByIndex(2)).toBe("cookie3");
  });

  it("should return null if the index is out of bounds", () => {
    Object.defineProperty(document, "cookie", {
      value: "cookie1=value1; cookie2=value2",
      writable: true,
      configurable: true,
    });

    expect(getCookieByIndex(3)).toBeNull();
  });

  it("should handle cookies with no value", () => {
    Object.defineProperty(document, "cookie", {
      value: "cookie1=; cookie2=value2",
      writable: true,
      configurable: true,
    });

    expect(getCookieByIndex(0)).toBe("cookie1");
    expect(getCookieByIndex(1)).toBe("cookie2");
  });

  it("should handle cookies with spaces around the name and value", () => {
    Object.defineProperty(document, "cookie", {
      value: " cookie1 = value1 ; cookie2 = value2 ",
      writable: true,
      configurable: true,
    });

    expect(getCookieByIndex(0)).toBe("cookie1");
    expect(getCookieByIndex(1)).toBe("cookie2");
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

    expect(getCookieByIndex(0)).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error occurred while getting cookie by index:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
