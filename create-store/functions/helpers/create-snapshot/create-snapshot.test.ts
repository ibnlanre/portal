import type { Dictionary } from "@/create-store/types/dictionary";

import { describe, expect, it } from "vitest";
import { createSnapshot } from "./index";

describe("createSnapshot", () => {
  it("should create a snapshot of the given state", () => {
    const state: Dictionary = { a: 1, b: 2, c: 3 };
    const snapshot = createSnapshot(state);

    expect(snapshot).toEqual(state);
    expect(snapshot).not.toBe(state);
  });

  it("should preserve the prototype of the original state", () => {
    class State {
      a = 1;
      b = 2;
    }

    const state = new State();
    const snapshot = createSnapshot(<any>state);

    expect(Object.getPrototypeOf(snapshot)).toBe(State.prototype);
  });

  it("should include non-enumerable properties in the snapshot", () => {
    const state: Dictionary = {};
    Object.defineProperty(state, "a", {
      value: 1,
      enumerable: false,
    });

    const snapshot = createSnapshot(state);

    expect(snapshot).toHaveProperty("a", 1);
    expect(Object.getOwnPropertyDescriptor(snapshot, "a")?.enumerable).toBe(
      false
    );
  });

  it("should deep clone nested objects, not maintain references", () => {
    const nested = { x: 10, y: 20 };
    const state = { a: 1, nested };

    const snapshot = createSnapshot(state);

    expect(snapshot.nested).toEqual(nested);
    expect(snapshot.nested).not.toBe(nested);

    nested.x = 99;
    expect(snapshot.nested.x).toBe(10);
  });

  it("should handle simple circular references", () => {
    const obj: any = { name: "circular" };
    obj.self = obj;

    const snapshot = createSnapshot(obj);

    expect(snapshot).not.toBe(obj);
    expect(snapshot.name).toBe("circular");
    expect(snapshot.self).toBe(snapshot);
    expect(snapshot.self.name).toBe("circular");
  });

  it("should handle mutual circular references", () => {
    const objA: any = { name: "A" };
    const objB: any = { name: "B" };
    objA.ref = objB;
    objB.ref = objA;

    const container = { a: objA, b: objB };
    const snapshot = createSnapshot(container);

    expect(snapshot).not.toBe(container);
    expect(snapshot.a).not.toBe(objA);
    expect(snapshot.b).not.toBe(objB);

    expect(snapshot.a.ref).toBe(snapshot.b);
    expect(snapshot.b.ref).toBe(snapshot.a);

    expect(snapshot.a.name).toBe("A");
    expect(snapshot.b.name).toBe("B");
  });

  it("should handle circular references in arrays", () => {
    const arr: any[] = [1, 2];
    arr.push(arr);

    const snapshot = createSnapshot(arr);

    expect(snapshot).not.toBe(arr);
    expect(snapshot[0]).toBe(1);
    expect(snapshot[1]).toBe(2);
    expect(snapshot[2]).toBe(snapshot);
    expect(snapshot[2][0]).toBe(1);
  });

  it("should handle deep circular references", () => {
    const root: any = {
      level1: {
        level2: {
          level3: {
            value: "deep",
          },
        },
      },
    };
    root.level1.level2.level3.backToRoot = root;

    const snapshot = createSnapshot(root);

    expect(snapshot).not.toBe(root);
    expect(snapshot.level1.level2.level3.value).toBe("deep");
    expect(snapshot.level1.level2.level3.backToRoot).toBe(snapshot);
    expect(
      snapshot.level1.level2.level3.backToRoot.level1.level2.level3.value
    ).toBe("deep");
  });

  it("should handle multiple references to the same object", () => {
    const shared = { value: "shared" };
    const container = {
      ref1: shared,
      ref2: shared,
      nested: {
        ref3: shared,
      },
    };

    const snapshot = createSnapshot(container);

    expect(snapshot).not.toBe(container);
    expect(snapshot.ref1).not.toBe(shared);

    expect(snapshot.ref1).toBe(snapshot.ref2);
    expect(snapshot.ref1).toBe(snapshot.nested.ref3);
    expect(snapshot.ref1.value).toBe("shared");
  });

  it("should handle circular references with Date objects", () => {
    const date = new Date("2023-01-01");
    const obj: any = {
      timestamp: date,
      value: "test",
    };
    obj.self = obj;

    const snapshot = createSnapshot(obj);

    expect(snapshot.timestamp).not.toBe(date);
    expect(snapshot.timestamp).toEqual(date);
    expect(snapshot.timestamp instanceof Date).toBe(true);
    expect(snapshot.self).toBe(snapshot);
    expect(snapshot.self.value).toBe("test");
  });

  it("should handle circular references with RegExp objects", () => {
    const regex = /test/gi;
    const obj: any = {
      pattern: regex,
      value: "test",
    };
    obj.self = obj;

    const snapshot = createSnapshot(obj);

    expect(snapshot.pattern).not.toBe(regex);
    expect(snapshot.pattern).toEqual(regex);
    expect(snapshot.pattern instanceof RegExp).toBe(true);
    expect(snapshot.self).toBe(snapshot);
    expect(snapshot.self.value).toBe("test");
  });

  it("should handle circular references with mixed data types", () => {
    const complex: any = {
      string: "hello",
      number: 42,
      boolean: true,
      null: null,
      undefined: undefined,
      date: new Date("2023-01-01"),
      regex: /pattern/g,
      array: [1, 2, 3],
      nested: {
        deep: {
          value: "nested",
        },
      },
    };

    complex.self = complex;
    complex.array.push(complex);
    complex.nested.backToRoot = complex;

    const snapshot = createSnapshot(complex);

    expect(snapshot).not.toBe(complex);
    expect(snapshot.string).toBe("hello");
    expect(snapshot.number).toBe(42);
    expect(snapshot.boolean).toBe(true);
    expect(snapshot.null).toBe(null);
    expect(snapshot.undefined).toBe(undefined);

    expect(snapshot.date).not.toBe(complex.date);
    expect(snapshot.date).toEqual(complex.date);

    expect(snapshot.regex).not.toBe(complex.regex);
    expect(snapshot.regex).toEqual(complex.regex);

    expect(snapshot.array).not.toBe(complex.array);
    expect(snapshot.array.slice(0, 3)).toEqual([1, 2, 3]);

    expect(snapshot.self).toBe(snapshot);
    expect(snapshot.array[3]).toBe(snapshot);
    expect(snapshot.nested.backToRoot).toBe(snapshot);
    expect(snapshot.nested.deep.value).toBe("nested");
  });

  it("should not create infinite loops when accessing circular properties", () => {
    const obj: any = { value: 1 };
    obj.circular = obj;

    const snapshot = createSnapshot(obj);

    expect(() => {
      const keys = Object.keys(snapshot);
      return keys.includes("value") && keys.includes("circular");
    }).not.toThrow();

    expect(() => {
      return JSON.stringify(snapshot, (key, value) => {
        return typeof value === "object" && value !== null && key !== ""
          ? "[Circular]"
          : value;
      });
    }).not.toThrow();
  });

  it("should deep clone without mutating original", () => {
    const original = {
      user: {
        preferences: {
          theme: "light",
          notifications: true,
        },
      },
    };

    const snapshot = createSnapshot(original);
    snapshot.user.preferences.theme = "MUTATED";

    expect(original.user.preferences.theme).toBe("light");
  });
});
