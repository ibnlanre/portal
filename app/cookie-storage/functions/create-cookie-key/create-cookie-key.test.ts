import { describe, expect, it } from "vitest";

import { createCookieKey } from "./index";

describe("createCookieKey", () => {
  it("should create a cookie key with default options", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
    });
    expect(result).toBe("tc");
  });

  it("should throw an error if the cookie fragment sizes are invalid", () => {
    expect(() =>
      createCookieKey({
        cookieFragmentDescription: "Test Cookie",
        cookieFragmentSizes: [1, 2, 3, 4, 5],
      })
    ).toThrow(
      "The number of fragments must be less than or equal to the number of words"
    );

    expect(() =>
      createCookieKey({
        cookieFragmentDescription: "Test Cookie",
        cookieFragmentSizes: [-3, 2],
      })
    ).toThrow("Each fragment must be a positive number");
  });

  it("should create a cookie key with custom options", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Verification Signature",
      cookieFragmentsConnector: "-",
      cookieFragmentSizes: [2, 3],
      cookiePrefix: "__",
      cookieScope: "secure",
      cookieScopeCase: "upper",
      cookieScopeFragmentConnector: "_",
    });
    expect(result).toBe("__SECURE_vr-sgt");
  });

  it("should handle title case scope", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
      cookieScope: "myScope",
      cookieScopeCase: "title",
    });
    expect(result).toBe("MyScope_tc");
  });

  it("should handle lower case scope", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
      cookieScope: "MyScope",
      cookieScopeCase: "lower",
    });
    expect(result).toBe("myscope_tc");
  });

  it("should handle upper case scope", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
      cookieScope: "myScope",
      cookieScopeCase: "upper",
    });
    expect(result).toBe("MYSCOPE_tc");
  });

  it("should handle custom scope connector", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
      cookieScope: "myScope",
      cookieScopeFragmentConnector: "-",
    });
    expect(result).toBe("MyScope-tc");
  });

  it("should handle custom fragment separator", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
      cookieFragmentsConnector: "-",
    });
    expect(result).toBe("t-c");
  });

  it("should handle different word lengths", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Very Long Cookie Description",
      cookieFragmentSizes: [1, 2, 3, 4],
    });
    expect(result).toBe("vlnckedsrp");
  });

  it("should handle empty cookie description", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "",
    });
    expect(result).toBe("");
  });
});
