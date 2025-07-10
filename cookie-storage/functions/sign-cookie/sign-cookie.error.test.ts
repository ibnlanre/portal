import { describe, expect, it, vi } from "vitest";

import { signCookie } from "./index";

import * as createHmacModule from "@/cookie-storage/helpers/create-hmac";

vi.mock("@/cookie-storage/helpers/create-hmac");

describe("signCookie", () => {
  it("should return the cookie if an error occurs", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    const cookie = "testCookie";
    const secret = "testSecret";

    const createHmacSpy = vi
      .spyOn(createHmacModule, "createHmac")
      .mockImplementationOnce(() => {
        throw new Error("Test error");
      });

    const signedCookie = signCookie(cookie, secret);

    expect(signedCookie).toEqual(cookie);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error occurred while signing cookie:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
    createHmacSpy.mockRestore();

    vi.restoreAllMocks();
  });
});
