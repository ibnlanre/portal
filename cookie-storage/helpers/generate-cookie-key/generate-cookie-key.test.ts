import { describe, expect, it } from "vitest";
import { generateCookieKey } from "./index";

describe("generateCookieKey", () => {
  it("should generate a cookie key with default options", () => {
    const result = generateCookieKey({
      cookieDescription: "Test Cookie",
    });
    expect(result).toBe("__app_tc");
  });

  it("should generate a cookie key with custom options", () => {
    const result = generateCookieKey({
      cookieDescription: "Verification Signature",
      wordLengths: [2, 3],
      cookieKeyPrefix: "__",
      cookieKeyScope: "secure",
      scopeCase: "upper",
      scopeConnector: "_",
      fragmentSeparator: "-",
    });
    expect(result).toBe("__SECURE_vr-sgt");
  });

  it("should handle title case scope", () => {
    const result = generateCookieKey({
      cookieDescription: "Test Cookie",
      cookieKeyScope: "myScope",
      scopeCase: "title",
    });
    expect(result).toBe("__MyScope_tc");
  });

  it("should handle lower case scope", () => {
    const result = generateCookieKey({
      cookieDescription: "Test Cookie",
      cookieKeyScope: "MyScope",
      scopeCase: "lower",
    });
    expect(result).toBe("__myscope_tc");
  });

  it("should handle upper case scope", () => {
    const result = generateCookieKey({
      cookieDescription: "Test Cookie",
      cookieKeyScope: "myScope",
      scopeCase: "upper",
    });
    expect(result).toBe("__MYSCOPE_tc");
  });

  it("should handle custom scope connector", () => {
    const result = generateCookieKey({
      cookieDescription: "Test Cookie",
      cookieKeyScope: "myScope",
      scopeConnector: "-",
    });
    expect(result).toBe("__myscope-tc");
  });

  it("should handle custom fragment separator", () => {
    const result = generateCookieKey({
      cookieDescription: "Test Cookie",
      fragmentSeparator: "-",
    });
    expect(result).toBe("__app_t-c");
  });

  it("should handle different word lengths", () => {
    const result = generateCookieKey({
      cookieDescription: "Very Long Cookie Description",
      wordLengths: [1, 2, 3, 4],
    });
    expect(result).toBe("__app_vlnckedsrp");
  });

  it("should handle empty cookie description", () => {
    const result = generateCookieKey({
      cookieDescription: "",
    });
    expect(result).toBe("__app_");
  });
});
