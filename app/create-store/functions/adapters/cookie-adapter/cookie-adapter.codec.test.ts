import { afterEach, describe, expect, it, vi } from "vitest";

import { cookieAdapter } from "./index";

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

describe("cookieAdapter default codec", () => {
  it.each(strings)("round-trips the string %j", async (text) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const [get, set] = cookieAdapter<unknown>("k");
    await set(text);
    expect(await get()).toBe(text);
    expect(error).not.toHaveBeenCalled();
  });

  it.each(objects)("round-trips %j", async (value) => {
    const [get, set] = cookieAdapter<unknown>("k");
    await set(value as never);
    expect(await get()).toEqual(value);
  });

  it("keeps the type of a string that looks like a number or boolean", async () => {
    const [get, set] = cookieAdapter<unknown>("k");
    await set("123");
    expect(typeof (await get())).toBe("string");
    await set("true");
    expect(await get()).toBe("true");
  });

  it.each(strings)("round-trips the string %j with a secret", (text) => {
    const [get, set] = cookieAdapter<string>("signed", { secret: "s3cret" });
    set(text);
    expect(get()).toBe(text);
  });

  it("round-trips an object with a secret", () => {
    const [get, set] = cookieAdapter<unknown>("signed", { secret: "s3cret" });
    set({ a: [1, null], b: "x" });
    expect(get()).toEqual({ a: [1, null], b: "x" });
  });

  it("honours a raw pair, and unknown codes read as absent", () => {
    const [get, set] = cookieAdapter<string>("currency", {
      parse: (v) => (v === "USD" || v === "NGN" ? v : undefined),
      stringify: (v) => v,
    });
    set("NGN");
    expect(document.cookie).toContain("currency=NGN");
    expect(get()).toBe("NGN");
    document.cookie = "currency=XXX; path=/";
    expect(get("fallback")).toBe("fallback");
  });
});
