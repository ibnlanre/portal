import { describe, expect, it } from "vitest";
import { normalizeObject } from "./index";

describe("normalizeObject", () => {
  it("should normalize basic objects", () => {
    const state = { name: "John", age: 30, active: true };
    const normalized = normalizeObject(state);

    expect(normalized).toEqual(state);
    expect(normalized.name).toBe("John");
    expect(normalized.age).toBe(30);
    expect(normalized.active).toBe(true);
  });

  it("should not filter out undefined and null values", () => {
    const state = {
      name: "John",
      age: undefined as string | undefined,
      email: null as string | null,
      active: true,
    };
    const normalized = normalizeObject(state);

    expect(normalized).toEqual(state);
    expect(normalized.name).toBe("John");
    expect(normalized.active).toBe(true);

    expect("age" in normalized).toBe(true);
    expect("email" in normalized).toBe(true);
  });

  it("should handle circular references", () => {
    const circularObj: {
      name: string;
      self?: typeof circularObj;
    } = { name: "circular" };
    circularObj.self = circularObj;

    const state = {
      data: circularObj,
      other: "value",
    };

    const normalized = normalizeObject(state);

    expect(normalized.other).toBe("value");

    expect(normalized.data).toBeDefined();
    expect(normalized.data.name).toBe("circular");

    expect(normalized.data.self).toBeDefined();
    expect(normalized.data.self?.name).toBe("circular");
  });

  it("should handle window object without circular reference errors", () => {
    if (typeof window !== "undefined") {
      expect(() => {
        const normalized = normalizeObject(window as any);

        expect(typeof normalized).toBe("object");
      }).not.toThrow();
    } else {
      const mockWindow: {
        document: object;
        location: { href: string };
        navigator: { userAgent: string };
        screen: { width: number; height: number };
        localStorage: object;
        sessionStorage: object;
        window?: typeof mockWindow;
        globalThis?: typeof mockWindow;
        self?: typeof mockWindow;
      } = {
        document: {},
        location: { href: "http://localhost" },
        navigator: { userAgent: "test" },
        screen: { width: 1920, height: 1080 },
        localStorage: {},
        sessionStorage: {},
      };

      mockWindow.window = mockWindow;
      mockWindow.globalThis = mockWindow;
      mockWindow.self = mockWindow;

      expect(() => {
        const normalized = normalizeObject(mockWindow);
        expect(typeof normalized).toBe("object");

        expect("window" in normalized).toBe(false);
        expect("globalThis" in normalized).toBe(false);
        expect("self" in normalized).toBe(false);

        expect(normalized.location).toBeDefined();
        expect(normalized.navigator).toBeDefined();
      }).not.toThrow();
    }
  });

  it("should handle nested objects with circular references", () => {
    const objA: {
      name: string;
      ref?: typeof objB;
    } = { name: "A" };

    const objB: {
      name: string;
      ref: typeof objA;
    } = { name: "B", ref: objA };

    objA.ref = objB;

    const state = {
      container: {
        a: objA,
        b: objB,
        simple: "value",
      },
    };

    const normalized = normalizeObject(state);

    expect(normalized.container).toBeDefined();
    expect(normalized.container.simple).toBe("value");
    expect(normalized.container.a).toBeDefined();
    expect(normalized.container.b).toBeDefined();
    expect(normalized.container.a.name).toBe("A");
    expect(normalized.container.b.name).toBe("B");
  });

  it("should strip out functions", () => {
    const state = {
      data: "value",
      method: () => "test",
      asyncMethod: async () => "async test",
    };

    const normalized = normalizeObject(state);

    expect(normalized.data).toBe("value");
    expect(typeof normalized.method).toBe("undefined");
    expect(typeof normalized.asyncMethod).toBe("undefined");
    expect("method" in normalized).toBe(false);
    expect("asyncMethod" in normalized).toBe(false);
  });

  it("should handle complex objects with mixed types", () => {
    const state = {
      string: "value",
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      object: { nested: "value" },
      func: () => "function",
      undef: undefined,
      nul: null,
      date: new Date(),
      regex: /test/g,
    };

    const normalized = normalizeObject(state);

    expect(normalized.string).toBe("value");
    expect(normalized.number).toBe(42);
    expect(normalized.boolean).toBe(true);
    expect(normalized.array).toEqual([1, 2, 3]);
    expect(normalized.object).toEqual({ nested: "value" });
    expect(typeof normalized.func).toBe("undefined");
    expect("func" in normalized).toBe(false);
    expect("undef" in normalized).toBe(true);
    expect("nul" in normalized).toBe(true);
    expect(normalized.date).toBeInstanceOf(Date);
    expect(normalized.regex).toBeInstanceOf(RegExp);
  });

  it("should throw error for non-object input", () => {
    expect(() => normalizeObject(null as any)).toThrow(
      "State must be an object"
    );
    expect(() => normalizeObject(undefined as any)).toThrow(
      "State must be an object"
    );
    expect(() => normalizeObject("string" as any)).toThrow(
      "State must be an object"
    );
    expect(() => normalizeObject(42 as any)).toThrow("State must be an object");
  });

  it("should handle empty objects", () => {
    const normalized = normalizeObject({});
    expect(normalized).toEqual({});
    expect(Object.keys(normalized)).toHaveLength(0);
  });

  it("should handle objects with symbol keys", () => {
    const sym = Symbol("test");
    const state = {
      [sym]: "symbol value",
      regular: "regular value",
    };

    const normalized = normalizeObject(state);

    expect(normalized.regular).toBe("regular value");
    expect(Object.getOwnPropertySymbols(normalized)).toHaveLength(0);
    expect((normalized as any)[sym]).toBeUndefined();
  });
});
