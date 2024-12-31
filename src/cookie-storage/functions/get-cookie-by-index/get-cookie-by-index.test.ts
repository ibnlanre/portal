import { beforeEach, describe, expect, it } from "vitest";
import { getCookieByIndex } from ".";

describe("getCookieByIndex", () => {
  beforeEach(() => {
    document.cookie = "";
  });

  it("should return null if document is undefined", () => {
    const originalDocument = global.document;

    Object.defineProperty(global, "document", {
      writable: true,
      value: undefined,
    });
    expect(getCookieByIndex(0)).toBeNull();

    global.document = originalDocument;
  });

  it("should return null if there are no cookies", () => {
    expect(getCookieByIndex(0)).toBeNull();
  });

  it("should return the cookie name at the specified index", () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "cookie1=value1; cookie2=value2; cookie3=value3",
    });

    expect(getCookieByIndex(0)).toBe("cookie1");
    expect(getCookieByIndex(1)).toBe("cookie2");
    expect(getCookieByIndex(2)).toBe("cookie3");
  });

  it("should return null if the index is out of bounds", () => {
    document.cookie = "cookie1=value1; cookie2=value2";
    expect(getCookieByIndex(3)).toBeNull();
  });

  it("should handle cookies with no value", () => {
    document.cookie = "cookie1=; cookie2=value2";
    expect(getCookieByIndex(0)).toBe("cookie1");
    expect(getCookieByIndex(1)).toBe("cookie2");
  });

  it("should handle cookies with spaces around the name and value", () => {
    document.cookie = " cookie1 = value1 ; cookie2 = value2 ";
    expect(getCookieByIndex(0)).toBe("cookie1");
    expect(getCookieByIndex(1)).toBe("cookie2");
  });
});
