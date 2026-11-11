import { afterEach, describe, expect, it, vi } from "vitest";

import { customAdapter } from "./index";

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

function memory() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach((c) => {
    document.cookie = `${c.split("=")[0].trim()}=; max-age=0; path=/`;
  });
  vi.restoreAllMocks();
});

describe("customAdapter default codec", () => {
  it.each(strings)("round-trips the string %j", async (text) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const [get, set] = customAdapter<unknown>("k", memory());
    await set(text);
    expect(await get()).toBe(text);
    expect(error).not.toHaveBeenCalled();
  });

  it.each(objects)("round-trips %j", async (value) => {
    const [get, set] = customAdapter<unknown>("k", memory());
    await set(value as never);
    expect(await get()).toEqual(value);
  });

  it("keeps the type of a string that looks like a number or boolean", async () => {
    const [get, set] = customAdapter<unknown>("k", memory());
    await set("123");
    expect(typeof (await get())).toBe("string");
    await set("true");
    expect(await get()).toBe("true");
  });

  it("writes a string JSON-quoted and honours a raw pair", () => {
    const storage = memory();
    customAdapter<string>("k", storage)[1]("dark");
    expect(storage.data.get("k")).toBe('"dark"');
    const raw = memory();
    const [get, set] = customAdapter<string>("k", {
      ...raw,
      parse: (v) => (v === "USD" ? v : undefined),
      stringify: (v) => v,
    });
    set("USD");
    expect(raw.data.get("k")).toBe("USD");
    expect(get()).toBe("USD");
    raw.data.set("k", "XXX");
    expect(get("fallback")).toBe("fallback");
  });
});
