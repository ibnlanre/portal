import { afterEach, describe, expect, it } from "vitest";

import { cookieAdapter, cookieStorage } from "../../index";

const key = "portal-integrity-contract";
afterEach(() => cookieStorage.removeItem(key));

describe("cookie integrity boundary", () => {
  it("accepts a valid signed value and a valid signed empty payload", () => {
    const [get, set] = cookieAdapter<{ role: string }>(key, {
      secret: "secret",
    });

    set({ role: "reader" });
    expect(get()).toEqual({ role: "reader" });
    cookieStorage.setItem(key, cookieStorage.sign("", "secret"));

    // Verification accepts the empty payload; the default parser then treats
    // empty text as absent, while a parser that takes text as is returns it.
    const [getText] = cookieAdapter<string>(key, {
      parse: (value) => value,
      secret: "secret",
    });
    expect(getText("fallback")).toBe("");
  });

  it.each(["unsigned", "tampered", "wrong key"])(
    "rejects %s input with and without a fallback",
    (kind) => {
      const payload = JSON.stringify({ role: "admin" });
      const sign = (kind: string) => {
        switch (kind) {
          case "tampered":
            return cookieStorage.sign(payload, "secret") + "x";
          case "unsigned":
            return payload;
          default:
            return cookieStorage.sign(payload, "another-secret");
        }
      };
      const value = sign(kind);
      cookieStorage.setItem(key, value);
      const [get] = cookieAdapter<{ role: string }>(key, {
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
