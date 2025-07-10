import { describe, expect, it, vi } from "vitest";

import { unsignCookie } from "./index";

import * as signCookieModule from "@/cookie-storage/functions/sign-cookie";

vi.mock("@/cookie-storage/functions/sign-cookie");

describe("unsignCookie", () => {
  it("should return null if an error occurs", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    const signCookieSpy = vi
      .spyOn(signCookieModule, "signCookie")
      .mockImplementationOnce(() => {
        throw new Error("Test error");
      });

    const result = unsignCookie(
      "testCookie.2xIaU8T83DetQNskBSOEzau/8RVU60XX1YCRBSUyA5E",
      "testSecret"
    );

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error occurred while unsigning cookie:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
    signCookieSpy.mockRestore();

    vi.restoreAllMocks();
  });
});
