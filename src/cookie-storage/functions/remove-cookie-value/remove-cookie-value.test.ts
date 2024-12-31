import { setCookieValue } from "@/cookie-storage/functions/set-cookie-value";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { removeCookieValue } from "./index";

vi.mock("@/cookie-storage/functions/set-cookie-value");

describe("removeCookieValue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call setCookieValue with the correct parameters", () => {
    document.cookie = "testCookie=testValue";
    removeCookieValue("testCookie");

    expect(setCookieValue).toHaveBeenCalledWith("testCookie", "", {
      path: "/",
      expires: 0,
    });
  });

  it("should call setCookieValue with the correct path", () => {
    removeCookieValue("testCookie", "/custom-path");

    expect(setCookieValue).toHaveBeenCalledWith("testCookie", "", {
      path: "/custom-path",
      expires: 0,
    });
  });

  it("should not call setCookieValue if document is undefined", () => {
    const originalDocument = global.document;

    Object.defineProperty(global, "document", {
      writable: true,
      value: undefined,
    });

    removeCookieValue("testCookie");
    expect(setCookieValue).not.toHaveBeenCalled();

    global.document = originalDocument;
  });

  it("should log an error if an exception occurs", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const error = new Error("Test error");
    vi.mocked(setCookieValue).mockImplementation(() => {
      throw error;
    });

    removeCookieValue("testCookie");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error occurred while removing testCookie from document.cookie",
      error
    );

    consoleErrorSpy.mockRestore();
  });
});
