import { afterEach, describe, expect, it, vi } from "vitest";

import { readPersisted, writePersisted } from "./index";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("readPersisted without a version", () => {
  it("treats null and undefined as absent", () => {
    expect(readPersisted(null, {})).toBeUndefined();
    expect(readPersisted(undefined, {})).toBeUndefined();
  });

  it("returns the stored value as is, never unwrapping an envelope", () => {
    expect(readPersisted({ a: 1 }, {})).toEqual({ a: 1 });
    expect(readPersisted({ $version: 4, state: { a: 1 } }, {})).toEqual({
      $version: 4,
      state: { a: 1 },
    });
  });

  it("never calls migrate", () => {
    const migrate = vi.fn();
    readPersisted({ $version: 1, state: 1 }, { migrate });
    expect(migrate).not.toHaveBeenCalled();
  });
});

describe("readPersisted with a version", () => {
  it("returns the state of a matching envelope", () => {
    expect(readPersisted({ $version: 2, state: 5 }, { version: 2 })).toBe(5);
  });

  it("treats null, undefined and a bare value as absent, without migrating", () => {
    const migrate = vi.fn();
    expect(readPersisted(null, { migrate, version: 1 })).toBeUndefined();
    expect(readPersisted({ a: 1 }, { migrate, version: 1 })).toBeUndefined();
    expect(readPersisted(5, { migrate, version: 0 })).toBeUndefined();
    expect(migrate).not.toHaveBeenCalled();
  });

  it("migrates an envelope of another version", () => {
    expect(
      readPersisted(
        { $version: 1, state: 1 },
        { migrate: (state, from) => Number(state) + from, version: 3 }
      )
    ).toBe(2);
  });

  it("treats an envelope of another version as absent without migrate", () => {
    expect(
      readPersisted({ $version: 9, state: 1 }, { version: 3 })
    ).toBeUndefined();
  });

  it("treats a failing or empty migration as absent", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const envelope = { $version: 1, state: 1 };
    expect(
      readPersisted(envelope, {
        migrate: () => {
          throw new Error("bad");
        },
        version: 2,
      })
    ).toBeUndefined();
    expect(
      readPersisted(envelope, { migrate: () => undefined as never, version: 2 })
    ).toBeUndefined();
  });

  it("does not mistake a lookalike for an envelope", () => {
    expect(
      readPersisted({ $version: "1", state: 1 }, { version: 1 })
    ).toBeUndefined();
    expect(readPersisted({ $version: 1 }, { version: 1 })).toBeUndefined();
  });
});

describe("writePersisted", () => {
  it("wraps only when versioned", () => {
    expect(writePersisted({ a: 1 }, undefined)).toEqual({ a: 1 });
    expect(writePersisted({ a: 1 }, 2)).toEqual({
      $version: 2,
      state: { a: 1 },
    });
  });
});
