import * as crypto from "crypto";

import { describe, expect, it, vi } from "vitest";

import { signCookie } from "./index";

vi.mock("crypto");

describe("signCookie", () => {
  it("should return the cookie if an error occurs", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    const cookie = "testCookie";
    const secret = "testSecret";

    const cryptoSpy = vi
      .spyOn(crypto, "createHmac")
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
    cryptoSpy.mockRestore();

    vi.restoreAllMocks();
  });
});
