import { afterEach, describe, expect, it } from "vitest";

import { cookieStorage, createCookieStorageAdapter } from "../../index";

const key = "portal-integrity-contract";
afterEach(() => cookieStorage.removeItem(key));

describe("cookie integrity boundary", () => {
  it("accepts a valid signed value and a valid signed empty payload", () => {
    const [get, set] = createCookieStorageAdapter<{ role: string }>(key, {
      secret: "secret",
    });
    set({ role: "reader" });
    expect(get()).toEqual({ role: "reader" });
    cookieStorage.setItem(key, cookieStorage.sign("", "secret"));
    const [getText] = createCookieStorageAdapter<string>(key, {
      secret: "secret",
    });
    expect(getText("fallback")).toBe("");
  });

  it.each(["unsigned", "tampered", "wrong key"])(
    "rejects %s input with and without a fallback",
    (kind) => {
      const payload = JSON.stringify({ role: "admin" });
      const value =
        kind === "unsigned"
          ? payload
          : kind === "tampered"
            ? cookieStorage.sign(payload, "secret") + "x"
            : cookieStorage.sign(payload, "another-secret");
      cookieStorage.setItem(key, value);
      const [get] = createCookieStorageAdapter<{ role: string }>(key, {
        secret: "secret",
      });
      expect(get()).toBeUndefined();
      expect(get({ role: "fallback" })).toEqual({ role: "fallback" });
    }
  );

  it("returns null for failed low-level verification and preserves valid empty strings", () => {
    expect(cookieStorage.unsign("unsigned", "secret")).toBeNull();
    expect(
      cookieStorage.unsign(cookieStorage.sign("value", "wrong"), "secret")
    ).toBeNull();
    expect(
      cookieStorage.unsign(cookieStorage.sign("", "secret"), "secret")
    ).toBe("");
  });
});
