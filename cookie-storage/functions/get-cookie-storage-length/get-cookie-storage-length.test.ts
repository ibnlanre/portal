import { describe, expect, it } from "vitest";
import { getCookieStorageLength } from "./index";

describe("getCookieStorageLength", () => {
  it("should return 0 if document is undefined", () => {
    const originalDocument = global.document;

    Object.defineProperty(global, "document", {
      writable: true,
      value: undefined,
    });

    expect(() => getCookieStorageLength()).not.toThrow();
    expect(getCookieStorageLength()).toBe(0);

    global.document = originalDocument;
  });

  it("should return 0 if there are no cookies", () => {
    Object.defineProperty(document, "cookie", {
      value: "",
      writable: true,
    });

    expect(getCookieStorageLength()).toBe(0);
  });

  it("should return the correct number of cookies", () => {
    Object.defineProperty(document, "cookie", {
      value: "cookie1=value1; cookie2=value2; cookie3=value3",
      writable: true,
    });

    expect(getCookieStorageLength()).toBe(3);
  });

  it("should handle cookies with extra spaces correctly", () => {
    Object.defineProperty(document, "cookie", {
      value: "cookie1=value1;  ; cookie2=value2; ; cookie3=value3",
      writable: true,
    });

    expect(getCookieStorageLength()).toBe(3);
  });
});
