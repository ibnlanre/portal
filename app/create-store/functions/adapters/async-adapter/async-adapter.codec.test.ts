import { afterEach, describe, expect, it, vi } from "vitest";

import { asyncAdapter } from "./index";

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
  const data = new Map<string, unknown>();
  return {
    data,
    getItem: (key: string) => Promise.resolve(data.get(key) as never),
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: unknown) => void data.set(key, value),
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

describe("asyncAdapter default codec", () => {
  it.each(strings)("round-trips the string %j", async (text) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const [get, set] = asyncAdapter<unknown>("k", memory());
    await set(text);
    expect(await get()).toBe(text);
    expect(error).not.toHaveBeenCalled();
  });

  it.each(objects)("round-trips %j", async (value) => {
    const [get, set] = asyncAdapter<unknown>("k", memory());
    await set(value as never);
    expect(await get()).toEqual(value);
  });

  it("keeps the type of a string that looks like a number or boolean", async () => {
    const [get, set] = asyncAdapter<unknown>("k", memory());
    await set("123");
    expect(typeof (await get())).toBe("string");
    await set("true");
    expect(await get()).toBe("true");
  });

  it("hands values to the storage as given, with no default codec", async () => {
    const storage = memory();
    await asyncAdapter<string>("k", storage)[1]("dark");
    expect(storage.data.get("k")).toBe("dark");
  });
});
