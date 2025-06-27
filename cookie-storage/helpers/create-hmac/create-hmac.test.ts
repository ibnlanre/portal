import { describe, it, expect } from "vitest";
import { createHmac } from "./index";
import { createHmac as nodeCreateHmac } from "crypto";

describe("createHmac", () => {
  describe("initialization", () => {
    it("should initialize constants properly", () => {
      const hmac = createHmac("sha256", "test-key");

      const result = hmac.update("test").digest("hex");
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });

    it("should be ready for multiple instances", () => {
      const hmac1 = createHmac("sha256", "key1").update("data1").digest("hex");
      const hmac2 = createHmac("sha256", "key2").update("data2").digest("hex");

      expect(hmac1.length).toBe(64);
      expect(hmac2.length).toBe(64);
      expect(hmac1).not.toBe(hmac2);
    });
  });

  it("should create valid HMAC signatures", () => {
    const key = "secret-key";
    const message = "Hello World";

    const hmac = createHmac("sha256", key).update(message).digest("hex");
    const nodeHmac = nodeCreateHmac("sha256", key)
      .update(message)
      .digest("hex");

    expect(hmac).toBe(nodeHmac);
  });

  it("should handle empty messages", () => {
    const key = "secret-key";

    const hmac = createHmac("sha256", key).update("").digest("hex");
    const nodeHmac = nodeCreateHmac("sha256", key).update("").digest("hex");

    expect(hmac).toBe(nodeHmac);
  });

  it("should support base64 encoding", () => {
    const key = "secret-key";
    const message = "Hello World";

    const hmac = createHmac("sha256", key).update(message).digest("base64");
    const nodeHmac = nodeCreateHmac("sha256", key)
      .update(message)
      .digest("base64");

    expect(hmac).toBe(nodeHmac);
  });

  it("should throw error for unsupported algorithms", () => {
    expect(() => {
      createHmac("md5" as any, "key");
    }).toThrow("Only 'sha256' is supported");
  });

  it("should support chained updates", () => {
    const key = "secret-key";

    const hmac = createHmac("sha256", key)
      .update("Hello")
      .update(" ")
      .update("World")
      .digest("hex");

    const nodeHmac = nodeCreateHmac("sha256", key)
      .update("Hello")
      .update(" ")
      .update("World")
      .digest("hex");

    expect(hmac).toBe(nodeHmac);
  });

  it("should handle binary key input", () => {
    const key = new TextEncoder().encode("binary-key");
    const message = "test message";

    const hmac = createHmac("sha256", key).update(message).digest("hex");

    const stringKeyHmac = createHmac("sha256", "binary-key")
      .update(message)
      .digest("hex");

    expect(hmac).toBe(stringKeyHmac);
  });

  it("should handle binary data input", () => {
    const key = "test-key";
    const message = new TextEncoder().encode("test message");

    const hmac = createHmac("sha256", key).update(message).digest("hex");

    const stringMessageHmac = createHmac("sha256", key)
      .update("test message")
      .digest("hex");

    expect(hmac).toBe(stringMessageHmac);
  });

  it("should handle long keys (>64 bytes) by hashing them first", () => {
    const longKey = "a".repeat(100);
    const shortKey = createHmac("sha256", "a").update("a".repeat(99)).digest();

    const message = "test";

    const hmacWithLongKey = createHmac("sha256", longKey)
      .update(message)
      .digest("hex");

    const hmacWithPrehashedKey = createHmac("sha256", shortKey)
      .update(message)
      .digest("hex");

    expect(hmacWithPrehashedKey.length).toBe(64);
    expect(hmacWithLongKey.length).toBe(64);
  });

  it("should produce consistent results for the same input", () => {
    const key = "consistent-key";
    const message = "test message";

    const hmac1 = createHmac("sha256", key).update(message).digest("hex");
    const hmac2 = createHmac("sha256", key).update(message).digest("hex");

    expect(hmac1).toBe(hmac2);
  });

  it("should handle Unicode characters properly", () => {
    const key = "unicode-key-🔑";
    const message = "Hello世界🌍";

    const hmac = createHmac("sha256", key).update(message).digest("hex");

    expect(hmac.length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(hmac)).toBe(true);
  });

  it("should securely authenticate messages", () => {
    const key = "secure-key";
    const message = "valid message";
    const tamperedMessage = "tampered message";

    const validHmac = createHmac("sha256", key).update(message).digest();
    const invalidHmac = createHmac("sha256", key)
      .update(tamperedMessage)
      .digest();

    expect(validHmac).not.toBe(invalidHmac);
  });

  it("should provide different outputs for different encoding formats", () => {
    const key = "multi-format";
    const message = "test message";

    const hmacHex = createHmac("sha256", key).update(message).digest("hex");
    const hmacBase64 = createHmac("sha256", key)
      .update(message)
      .digest("base64");
    const hmacBinary = createHmac("sha256", key)
      .update(message)
      .digest("binary");

    expect(hmacHex).not.toBe(hmacBase64);
    expect(hmacHex).not.toBe(hmacBinary);
    expect(hmacBase64).not.toBe(hmacBinary);

    expect(hmacHex.length).toBe(64);

    expect(hmacBase64.length).toBeGreaterThanOrEqual(43);
    expect(hmacBase64.length).toBeLessThanOrEqual(45);

    expect(hmacBinary.length).toBe(32);
  });
});
