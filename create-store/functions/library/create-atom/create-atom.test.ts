import { describe, expect, it } from "vitest";

import { atomic } from "@/create-store/constants/atomic";

import { createAtom } from "./index";

describe("createAtom", () => {
  describe("Basic Functionality", () => {
    it("should mark an object as atomic", () => {
      const obj = { theme: "dark", language: "en" };
      const atom = createAtom(obj);

      expect(atomic in atom).toBe(true);
      expect(atom[atomic]).toBe(true);
    });

    it("should return the same reference if already atomic", () => {
      const obj = { theme: "dark", language: "en" };
      const atom1 = createAtom(obj);
      const atom2 = createAtom(atom1);

      expect(atom1).toBe(atom2);
      expect(atom1[atomic]).toBe(true);
      expect(atom2[atomic]).toBe(true);
    });

    it("should preserve object properties", () => {
      const obj = { theme: "dark", language: "en", count: 42 };
      const atom = createAtom(obj);

      expect(atom.theme).toBe("dark");
      expect(atom.language).toBe("en");
      expect(atom.count).toBe(42);
    });

    it("should make atomic symbol non-enumerable", () => {
      const obj = { theme: "dark", language: "en" };
      const atom = createAtom(obj);

      const keys = Object.keys(atom);
      expect(keys).toEqual(["theme", "language"]);
      expect(keys).not.toContain(atomic);

      const enumerableKeys: string[] = [];
      for (const key in atom) {
        enumerableKeys.push(key);
      }
      expect(enumerableKeys).toEqual(["theme", "language"]);
    });

    it("should make atomic symbol non-configurable and non-writable", () => {
      const obj = { theme: "dark" };
      const atom = createAtom(obj);

      const descriptor = Object.getOwnPropertyDescriptor(atom, atomic);
      expect(descriptor).toBeDefined();
      expect(descriptor?.configurable).toBe(false);
      expect(descriptor?.writable).toBe(false);
      expect(descriptor?.enumerable).toBe(false);
      expect(descriptor?.value).toBe(true);
    });
  });

  describe("DeepPartial Support", () => {
    interface FullInterface {
      required: string;
      optional: number;
      nested: {
        prop1: string;
        prop2: number;
        deep: {
          value: boolean;
          optional?: string;
        };
      };
    }

    it("should accept partial objects", () => {
      const atom1 = createAtom<FullInterface>({
        required: "test",
      });

      expect(atom1.required).toBe("test");
      expect(atom1.optional).toBeUndefined();
      expect(atom1.nested).toBeUndefined();
    });

    it("should accept partially nested objects", () => {
      const atom = createAtom<FullInterface>({
        required: "test",
        nested: {
          prop1: "partial",
        },
      });

      expect(atom.required).toBe("test");
      expect(atom.nested?.prop1).toBe("partial");
      expect(atom.nested?.prop2).toBeUndefined();
      expect(atom.nested?.deep).toBeUndefined();
    });

    it("should accept deeply nested partial objects", () => {
      const atom = createAtom<FullInterface>({
        nested: {
          deep: {
            value: true,
          },
        },
      });

      expect(atom.nested?.deep?.value).toBe(true);
      expect(atom.nested?.deep?.optional).toBeUndefined();
      expect(atom.nested?.prop1).toBeUndefined();
      expect(atom.required).toBeUndefined();
    });

    it("should work with empty objects", () => {
      const atom = createAtom<FullInterface>({});

      expect(Object.keys(atom)).toEqual([]);
      expect(atomic in atom).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle objects with symbol properties", () => {
      const sym1 = Symbol("test1");
      const sym2 = Symbol("test2");
      const obj = {
        prop: "value",
        [sym1]: "symbol1",
        [sym2]: "symbol2",
      };

      const atom = createAtom(obj);

      expect(atom.prop).toBe("value");
      expect(atom[sym1]).toBe("symbol1");
      expect(atom[sym2]).toBe("symbol2");
      expect(atomic in atom).toBe(true);
    });

    it("should handle objects with non-enumerable properties", () => {
      const obj = { visible: "value" };
      Object.defineProperty(obj, "hidden", {
        enumerable: false,
        value: "hidden value",
        writable: true,
      });

      const atom = createAtom(obj);

      expect(atom.visible).toBe("value");
      expect((atom as any).hidden).toBe("hidden value");
      expect(Object.keys(atom)).toEqual(["visible"]);
    });

    it("should handle already atomic objects with additional properties", () => {
      const obj = { theme: "dark" };
      const atom1 = createAtom(obj);

      // Add property after making atomic
      (atom1 as any).newProp = "new value";

      const atom2 = createAtom(atom1);

      expect(atom1).toBe(atom2);
      expect((atom2 as any).newProp).toBe("new value");
      expect(atom2[atomic]).toBe(true);
    });
  });

  describe("Type Safety", () => {
    it("should maintain type information", () => {
      interface TestInterface {
        name: string;
        age: number;
        settings?: {
          theme: "light" | "dark";
        };
      }

      const atom = createAtom<TestInterface>({
        name: "John",
      });

      // TypeScript should infer these correctly
      expect(typeof atom.name).toBe("string");
      expect(atom.age).toBeUndefined();
      expect(atom.settings).toBeUndefined();

      // The atomic symbol should be present
      expect(atomic in atom).toBe(true);
    });
  });
});
