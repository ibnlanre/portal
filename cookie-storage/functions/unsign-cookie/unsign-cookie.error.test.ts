import { Buffer } from "buffer";
import { describe, expect, it, vi } from "vitest";

import { unsignCookie } from "./index";

vi.mock("buffer");

describe("unsignCookie", () => {
  it("should return null if an error occurs", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    const result = unsignCookie(
      "testCookie.2xIaU8T83DetQNskBSOEzau/8RVU60XX1YCRBSUyA5E",
      "testSecret"
    );

    const bufferSpy = vi.spyOn(Buffer, "from").mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error occurred while unsigning cookie:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
    bufferSpy.mockRestore();

    vi.restoreAllMocks();
  });
});
