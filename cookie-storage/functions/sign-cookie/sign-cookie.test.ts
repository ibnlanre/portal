import { describe, expect, it } from "vitest";

import { signCookie } from "@/cookie-storage/functions/sign-cookie";
import { createHmac } from "@/cookie-storage/helpers/create-hmac";
import { unsignCookie } from "@/cookie-storage/functions/unsign-cookie";

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

  it("should initialize crypto constants safely", () => {
    // This test ensures that the lazy initialization works correctly
    // and can be called multiple times safely
    const hmac1 = createHmac("sha256", "test-key");
    const result1 = hmac1.update("test data").digest("hex");

    const hmac2 = createHmac("sha256", "test-key");
    const result2 = hmac2.update("test data").digest("hex");

    expect(result1).toBe(result2);
    expect(typeof result1).toBe("string");
    expect(result1.length).toBe(64); // SHA-256 hex digest is 64 characters
  });

  it("should sign and unsign cookies correctly", () => {
    const cookie = "user=john_doe";
    const secret = "my-secret-key";

    // Sign the cookie
    const signedCookie = signCookie(cookie, secret);

    // Verify the signed cookie has the expected format
    expect(signedCookie).toContain(".");
    expect(signedCookie).toMatch(/^user=john_doe\./);

    // Unsign the cookie
    const unsignedCookie = unsignCookie(signedCookie, secret);

    // Verify unsigning works correctly
    expect(unsignedCookie).toBe(cookie);
  });

  it("should return original cookie when no secret is provided", () => {
    const cookie = "user=john_doe";
    const signedCookie = signCookie(cookie);

    expect(signedCookie).toBe(cookie);
  });

  it("should return original cookie when empty secret is provided", () => {
    const cookie = "user=john_doe";
    const signedCookie = signCookie(cookie, "");

    expect(signedCookie).toBe(cookie);
  });

  it("should produce consistent signatures for same input", () => {
    const cookie = "sessionId=abc123";
    const secret = "consistent-key";

    const signed1 = signCookie(cookie, secret);
    const signed2 = signCookie(cookie, secret);

    expect(signed1).toBe(signed2);
  });

  it("should produce different signatures for different secrets", () => {
    const cookie = "user=alice";
    const secret1 = "secret1";
    const secret2 = "secret2";

    const signed1 = signCookie(cookie, secret1);
    const signed2 = signCookie(cookie, secret2);

    expect(signed1).not.toBe(signed2);
  });

  it("should handle special characters in cookie values", () => {
    const cookie = 'data={"name":"John Doe","email":"john@example.com"}';
    const secret = "test-secret";

    const signedCookie = signCookie(cookie, secret);
    const unsignedCookie = unsignCookie(signedCookie, secret);

    expect(unsignedCookie).toBe(cookie);
  });

  it("should handle Unicode characters", () => {
    const cookie = "greeting=Hello世界🌍";
    const secret = "unicode-test";

    const signedCookie = signCookie(cookie, secret);
    const unsignedCookie = unsignCookie(signedCookie, secret);

    expect(unsignedCookie).toBe(cookie);
  });

  it("should fail to unsign with wrong secret", () => {
    const cookie = "user=bob";
    const correctSecret = "correct-secret";
    const wrongSecret = "wrong-secret";

    const signedCookie = signCookie(cookie, correctSecret);
    const unsignedCookie = unsignCookie(signedCookie, wrongSecret);

    expect(unsignedCookie).toBe(null);
  });

  it("should fail to unsign tampered cookie", () => {
    const cookie = "user=charlie";
    const secret = "tamper-test";

    const signedCookie = signCookie(cookie, secret);
    const tamperedCookie = signedCookie.replace("charlie", "mallory");
    const unsignedCookie = unsignCookie(tamperedCookie, secret);

    expect(unsignedCookie).toBe(null);
  });
});
