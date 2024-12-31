import { clearCookieStorage } from "@/cookie-storage/functions/clear-cookie-storage";
import { getCookieByIndex } from "@/cookie-storage/functions/get-cookie-by-index";
import { getCookieStorageLength } from "@/cookie-storage/functions/get-cookie-storage-length";
import { getCookieValue } from "@/cookie-storage/functions/get-cookie-value";
import { removeCookieValue } from "@/cookie-storage/functions/remove-cookie-value";
import { setCookieValue } from "@/cookie-storage/functions/set-cookie-value";
import { signCookie } from "@/cookie-storage/functions/sign-cookie";
import { unsignCookie } from "@/cookie-storage/functions/unsign-cookie";
import { describe, expect, it, vi } from "vitest";
import { cookieStorage } from "./index";

vi.mock("@/cookie-storage/functions/clear-cookie-storage");
vi.mock("@/cookie-storage/functions/get-cookie-by-index");
vi.mock("@/cookie-storage/functions/get-cookie-storage-length");
vi.mock("@/cookie-storage/functions/get-cookie-value");
vi.mock("@/cookie-storage/functions/remove-cookie-value");
vi.mock("@/cookie-storage/functions/set-cookie-value");
vi.mock("@/cookie-storage/functions/sign-cookie");
vi.mock("@/cookie-storage/functions/unsign-cookie");

describe("cookieStorage", () => {
  it("should sign a cookie", () => {
    const value = "value";
    const signedValue = "signedValue";
    vi.mocked(signCookie).mockReturnValue(signedValue);

    const result = cookieStorage.sign(value, "secret");
    expect(result).toBe(signedValue);
    expect(signCookie).toHaveBeenCalledWith(value, "secret");
  });

  it("should unsign a cookie", () => {
    const signedValue = "signedValue";
    const value = "value";
    vi.mocked(unsignCookie).mockReturnValue(value);

    const result = cookieStorage.unsign(signedValue, "secret");
    expect(result).toBe(value);
    expect(unsignCookie).toHaveBeenCalledWith(signedValue, "secret");
  });

  it("should get a cookie value", () => {
    const key = "key";
    const value = "value";
    vi.mocked(getCookieValue).mockReturnValue(value);

    const result = cookieStorage.getItem(key);
    expect(result).toBe(value);
    expect(getCookieValue).toHaveBeenCalledWith(key);
  });

  it("should set a cookie value", () => {
    const key = "key";
    const value = "value";

    cookieStorage.setItem(key, value);
    expect(setCookieValue).toHaveBeenCalledWith(key, value);
  });

  it("should remove a cookie value", () => {
    const key = "key";

    cookieStorage.removeItem(key);
    expect(removeCookieValue).toHaveBeenCalledWith(key);
  });

  it("should clear all cookies", () => {
    cookieStorage.clear();
    expect(clearCookieStorage).toHaveBeenCalled();
  });

  it("should get a cookie key by index", () => {
    const index = 0;
    const key = "key";
    vi.mocked(getCookieByIndex).mockReturnValue(key);

    const result = cookieStorage.key(index);
    expect(result).toBe(key);
    expect(getCookieByIndex).toHaveBeenCalledWith(index);
  });

  it("should get the length of cookie storage", () => {
    const length = 5;
    vi.mocked(getCookieStorageLength).mockReturnValue(length);

    const result = cookieStorage.length;
    expect(result).toBe(length);
    expect(getCookieStorageLength).toHaveBeenCalled();
  });
});
