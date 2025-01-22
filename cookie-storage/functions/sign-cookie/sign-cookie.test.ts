import { signCookie } from "@/cookie-storage/functions/sign-cookie";
import { describe, expect, it } from "vitest";

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
});
