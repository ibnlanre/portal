import * as crypto from "crypto";

import { describe, expect, it, vi } from "vitest";

import { signCookie } from "@/cookie-storage/functions/sign-cookie";

describe("signCookie", () => {
  it("should sign the cookie with the given secret", () => {
    const cookie = "testCookie";
    const secret = "testSecret";
    const signedCookie = signCookie(cookie, secret);

    expect(signedCookie).toEqual(
      expect.stringMatching(/testCookie\.[a-zA-Z0-9+/=]+/)
    );
  });

  it("should produce different signatures for different secrets", () => {
    const cookie = "testCookie";
    const secret1 = "testSecret1";
    const secret2 = "testSecret2";
    const signedCookie1 = signCookie(cookie, secret1);
    const signedCookie2 = signCookie(cookie, secret2);

    expect(signedCookie1).not.toEqual(signedCookie2);
  });

  it("should produce different signatures for different cookies", () => {
    const cookie1 = "testCookie1";
    const cookie2 = "testCookie2";
    const secret = "testSecret";
    const signedCookie1 = signCookie(cookie1, secret);
    const signedCookie2 = signCookie(cookie2, secret);

    expect(signedCookie1).not.toEqual(signedCookie2);
  });

  it("should produce the same signature for the same cookie and secret", () => {
    const cookie = "testCookie";
    const secret = "testSecret";
    const signedCookie1 = signCookie(cookie, secret);
    const signedCookie2 = signCookie(cookie, secret);

    expect(signedCookie1).toEqual(signedCookie2);
  });

  it("should return the cookie if the secret is empty", () => {
    const cookie = "testCookie";
    const signedCookie = signCookie(cookie);

    expect(signedCookie).toEqual(cookie);
  });
});
