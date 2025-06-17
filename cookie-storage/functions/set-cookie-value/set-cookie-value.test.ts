import type { CookieOptions } from "@/cookie-storage/types/cookie-options";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { setCookieValue } from "./index";
import { formatCookieOptions } from "@/cookie-storage/helpers/format-cookie-options";

vi.mock("@/cookie-storage/helpers/format-cookie-options");

describe("setCookieValue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set a cookie with the specified name and value", () => {
    const name = "testCookie";
    const value = "testValue";
    const options: CookieOptions = { maxAge: 3600, path: "/" };

    const expectedOptions = "; path=/; max-age=3600";
    vi.mocked(formatCookieOptions).mockReturnValue(expectedOptions);

    const cookieSpy = vi.spyOn(document, "cookie", "set");
    setCookieValue(name, value, options);
    const expectedCookie = `${name}=${value}${expectedOptions}`;

    expect(formatCookieOptions).toHaveBeenCalledWith(options);
    expect(cookieSpy).toHaveBeenCalledWith(
      expect.stringContaining(expectedCookie)
    );
  });

  it("should set a cookie without options", () => {
    const name = "testCookie";
    const value = "testValue";

    const expectedOptions = "; path=/";
    vi.mocked(formatCookieOptions).mockReturnValue(expectedOptions);

    const cookieSpy = vi.spyOn(document, "cookie", "set");
    setCookieValue(name, value);
    const expectedCookie = `${name}=${value}${expectedOptions}`;

    expect(formatCookieOptions).toHaveBeenCalledWith(undefined);
    expect(cookieSpy).toHaveBeenCalledWith(
      expect.stringContaining(expectedCookie)
    );
  });

  it("should not set a cookie if document is undefined", () => {
    const originalDocument = global.document;

    Object.defineProperty(global, "document", {
      configurable: true,
      value: undefined,
      writable: true,
    });

    const name = "testCookie";
    const value = "testValue";

    setCookieValue(name, value);
    expect(formatCookieOptions).not.toHaveBeenCalled();

    global.document = originalDocument;
  });

  it("should log an error if an exception occurs", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const name = "testCookie";
    const value = "testValue";

    vi.mocked(formatCookieOptions).mockImplementation(() => {
      throw new Error("Test error");
    });

    setCookieValue(name, value);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error occurred while setting cookie:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
