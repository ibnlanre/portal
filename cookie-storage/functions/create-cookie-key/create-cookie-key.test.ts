import { describe, expect, it } from "vitest";
import { createCookieKey } from "./index";

describe("createCookieKey", () => {
  it("should create a cookie key with default options", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
    });
    expect(result).toBe("__Host_tc");
  });

  it("should create a cookie key with custom options", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Verification Signature",
      cookieFragmentSizes: [2, 3],
      cookiePrefix: "__",
      cookieScope: "secure",
      cookieScopeCase: "upper",
      cookieScopeFragmentConnector: "_",
      cookieFragmentsConnector: "-",
    });
    expect(result).toBe("__SECURE_vr-sgt");
  });

  it("should handle title case scope", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
      cookieScope: "myScope",
      cookieScopeCase: "title",
    });
    expect(result).toBe("__MyScope_tc");
  });

  it("should handle lower case scope", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
      cookieScope: "MyScope",
      cookieScopeCase: "lower",
    });
    expect(result).toBe("__myscope_tc");
  });

  it("should handle upper case scope", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
      cookieScope: "myScope",
      cookieScopeCase: "upper",
    });
    expect(result).toBe("__MYSCOPE_tc");
  });

  it("should handle custom scope connector", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
      cookieScope: "myScope",
      cookieScopeFragmentConnector: "-",
    });
    expect(result).toBe("__MyScope-tc");
  });

  it("should handle custom fragment separator", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Test Cookie",
      cookieFragmentsConnector: "-",
    });
    expect(result).toBe("__Host_t-c");
  });

  it("should handle different word lengths", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "Very Long Cookie Description",
      cookieFragmentSizes: [1, 2, 3, 4],
    });
    expect(result).toBe("__Host_vlnckedsrp");
  });

  it("should handle empty cookie description", () => {
    const result = createCookieKey({
      cookieFragmentDescription: "",
    });
    expect(result).toBe("__Host");
  });
});
