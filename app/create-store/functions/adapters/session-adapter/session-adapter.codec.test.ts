import { afterEach, describe, expect, it, vi } from "vitest";

import { sessionAdapter } from "./index";

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

describe("sessionAdapter default codec", () => {
  it.each(strings)("round-trips the string %j", async (text) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const [get, set] = sessionAdapter<unknown>("k");
    await set(text);
    expect(await get()).toBe(text);
    expect(error).not.toHaveBeenCalled();
  });

  it.each(objects)("round-trips %j", async (value) => {
    const [get, set] = sessionAdapter<unknown>("k");
    await set(value as never);
    expect(await get()).toEqual(value);
  });

  it("keeps the type of a string that looks like a number or boolean", async () => {
    const [get, set] = sessionAdapter<unknown>("k");
    await set("123");
    expect(typeof (await get())).toBe("string");
    await set("true");
    expect(await get()).toBe("true");
  });

  it("writes a string JSON-quoted and honours a raw pair", () => {
    sessionAdapter<string>("k")[1]("dark");
    expect(sessionStorage.getItem("k")).toBe('"dark"');
    const [get, set] = sessionAdapter<string>("raw", {
      parse: (v) => (v === "USD" ? v : undefined),
      stringify: (v) => v,
    });
    set("USD");
    expect(sessionStorage.getItem("raw")).toBe("USD");
    expect(get()).toBe("USD");
    sessionStorage.setItem("raw", "XXX");
    expect(get("fallback")).toBe("fallback");
  });
});
