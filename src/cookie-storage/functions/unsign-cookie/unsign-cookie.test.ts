import { signCookie } from "@/cookie-storage/functions/sign-cookie";
import { describe, expect, it } from "vitest";
import { unsignCookie } from "./index";

describe("unsignCookie", () => {
  const secret = "mySecret";

  it("should return the original cookie if the signature is valid", () => {
    const cookie = "testCookie";
    const signedCookie = signCookie(cookie, secret);
    const result = unsignCookie(signedCookie, secret);
    expect(result).toBe(cookie);
  });

  it("should return null if the signed cookie does not contain a demarcator", () => {
    const invalidSignedCookie = "invalidSignedCookie";
    const result = unsignCookie(invalidSignedCookie, secret);
    expect(result).toBeNull();
  });

  it("should return null if the signature is invalid", () => {
    const cookie = "testCookie";
    const invalidSignedCookie = `${cookie}.invalidSignature`;
    const result = unsignCookie(invalidSignedCookie, secret);
    expect(result).toBeNull();
  });

  it("should return null if the signed cookie length does not match the expected signature length", () => {
    const cookie = "testCookie";
    const signedCookie = signCookie(cookie, secret);
    const modifiedSignedCookie = signedCookie + "extraData";
    const result = unsignCookie(modifiedSignedCookie, secret);
    expect(result).toBeNull();
  });
});
