import { afterEach, describe, expect, it, vi } from "vitest";

import { localAdapter } from "./index";

const strings = [
  "dark",
  "123",
  "true",
  "null",
  "",
  'say "hi"',
  "back\\slash",
  "héllo ✓ 日本 😀",
];
const objects = [
  { a: 1, b: null, c: [1, "2", false], d: { e: "x" } },
  [1, "two", null, { three: 3 }],
  0,
  42,
  true,
  false,
] as const;

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach((c) => {
    document.cookie = `${c.split("=")[0].trim()}=; max-age=0; path=/`;
  });
  vi.restoreAllMocks();
});

describe("localAdapter default codec", () => {
  it.each(strings)("round-trips the string %j", async (text) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const [get, set] = localAdapter<unknown>("k");
    await set(text);
    expect(await get()).toBe(text);
    expect(error).not.toHaveBeenCalled();
  });

  it.each(objects)("round-trips %j", async (value) => {
    const [get, set] = localAdapter<unknown>("k");
    await set(value as never);
    expect(await get()).toEqual(value);
  });

  it("keeps the type of a string that looks like a number or boolean", async () => {
    const [get, set] = localAdapter<unknown>("k");
    await set("123");
    expect(typeof (await get())).toBe("string");
    await set("true");
    expect(await get()).toBe("true");
  });

  it("writes a string JSON-quoted", () => {
    const [, set] = localAdapter<string>("k");
    set("dark");
    expect(localStorage.getItem("k")).toBe('"dark"');
  });

  it("reads text a raw parse understands, and absent when unparsable", () => {
    const [get] = localAdapter<string>("k", {
      parse: (v) => (v === "USD" || v === "NGN" ? v : undefined),
      stringify: (v) => v,
    });
    localStorage.setItem("k", "USD");
    expect(get()).toBe("USD");
    localStorage.setItem("k", "XXX");
    expect(get("fallback")).toBe("fallback");
  });

  it("reads a string stored raw by an earlier version as absent", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("k", "dark");
    expect(localAdapter<string>("k")[0]("fallback")).toBe("fallback");
    expect(error).toHaveBeenCalled();
  });
});
