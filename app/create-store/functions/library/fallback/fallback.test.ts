import type { GenericObject } from "@/create-store/types/generic-object";

import { describe, expect, expectTypeOf, it } from "vitest";

import { fallback } from "./index";

describe("fallback function", () => {
  describe("Basic functionality", () => {
    it("should provide fallback values for missing properties", () => {
      const outerState = { count: 5, name: "default" };
      const innerState = { active: true };

      const fallbackFn = fallback(outerState);
      const result = fallbackFn(innerState);

      expect(result).toEqual({
        active: true,
        count: 5,
        name: "default",
      });
    });

    it("should override fallback values with inner state values", () => {
      const outerState = { count: 5, name: "default" };
      const innerState = { active: true, count: 10 };

      const fallbackFn = fallback(outerState);
      const result = fallbackFn(innerState);

      expect(result).toEqual({
        active: true,
        count: 10,
        name: "default",
      });
    });

    it("should work with empty outer state", () => {
      const outerState = {};
      const innerState = { count: 10, name: "test" };

      const fallbackFn = fallback(outerState);
      const result = fallbackFn(innerState);

      expect(result).toEqual({
        count: 10,
        name: "test",
      });
    });

    it("should work with empty inner state", () => {
      const outerState = { count: 5, name: "default" };
      const innerState = {};

      const fallbackFn = fallback(outerState);
      const result = fallbackFn(innerState);

      expect(result).toEqual({
        count: 5,
        name: "default",
      });
    });

    it("should work with both states empty", () => {
      const outerState = {};
      const innerState = {};

      const fallbackFn = fallback(outerState);
      const result = fallbackFn(innerState);

      expect(result).toEqual({});
    });
  });

  describe("Complex object merging", () => {
    it("should handle nested objects", () => {
      const outerState = {
        config: { retry: 3, timeout: 5000 },
        user: { name: "default" },
      };
      const innerState = {
        config: { timeout: 3000 },
        data: { items: [] },
      };

      const fallbackFn = fallback(outerState);
      const result = fallbackFn(innerState);

      expect(result).toEqual({
        config: { retry: 3, timeout: 3000 },
        data: { items: [] },
        user: { name: "default" },
      });
    });

    it("should handle arrays", () => {
      const outerState = { items: [1, 2, 3], tags: ["default"] };
      const innerState = { count: 5, items: [4, 5] };

      const fallbackFn = fallback(outerState);
      const result = fallbackFn(innerState);

      expect(result).toEqual({
        count: 5,
        items: [4, 5],
        tags: ["default"],
      });
    });

    it("should handle functions", () => {
      const defaultFn = () => "default";
      const customFn = () => "custom";

      const outerState = { data: { value: 1 }, handler: defaultFn };
      const innerState = { active: true, handler: customFn };

      const fallbackFn = fallback(outerState);
      const result = fallbackFn(innerState);

      expect(result.handler()).toBe("custom");
      expect(result.data).toEqual({ value: 1 });
      expect(result.active).toBe(true);
    });

    it("should handle null and undefined values", () => {
      const outerState = {
        nullable: null,
        optional: undefined,
        value: "default",
      };
      const innerState = { missing: "present", nullable: "not null" };

      const fallbackFn = fallback(outerState);
      const result = fallbackFn(innerState);

      expect(result).toEqual({
        missing: "present",
        nullable: "not null",
        optional: undefined,
        value: "default",
      });
    });
  });

  describe("Selector usage patterns", () => {
    it("should provide defaults for partial state access", () => {
      const defaults = {
        config: { theme: "light" },
        count: 0,
        enabled: false,
      };

      const partialState = { count: 5 };

      const fallbackFn = fallback(defaults);
      const result = fallbackFn(partialState);

      expect(result.count).toBe(5);
      expect(result.enabled).toBe(false);
      expect(result.config).toEqual({ theme: "light" });
    });

    it("should work with destructuring patterns", () => {
      const defaults = { active: false, count: 0, name: "unknown" };
      const state = { count: 10 };

      const fallbackFn = fallback(defaults);
      const { active, count, name } = fallbackFn(state);

      expect(count).toBe(10);
      expect(name).toBe("unknown");
      expect(active).toBe(false);
    });

    it("should handle optional chaining scenarios", () => {
      const defaults = {
        settings: { notifications: true },
        user: { profile: { name: "Guest" } },
      };

      const state = {
        data: { items: [] },
        user: { id: 123 },
      };

      const fallbackFn = fallback(defaults);
      const result = fallbackFn(state);

      expect(result.user).toEqual({ id: 123, profile: { name: "Guest" } });
      expect(result.settings).toEqual({ notifications: true });
      expect(result.data).toEqual({ items: [] });
    });
  });

  describe("Type safety", () => {
    it("should maintain proper type inference", () => {
      const defaults = { count: 0, name: "default" };
      const state = { active: true, count: 5 };

      const fallbackFn = fallback(defaults);
      const result = fallbackFn(state);

      expectTypeOf(result.count).toEqualTypeOf<number>();
      expectTypeOf(result.name).toEqualTypeOf<string>();
      expectTypeOf(result.active).toEqualTypeOf<boolean>();
    });

    it("should handle different property types", () => {
      const defaults = {
        arr: [] as string[],
        bool: false,
        num: 0,
        obj: {} as { nested: number },
        str: "default",
      };

      const state = {
        bool: true,
        extra: "additional",
        num: 42,
        str: "updated",
      };

      const fallbackFn = fallback(defaults);
      const result = fallbackFn(state);

      expectTypeOf(result.str).toEqualTypeOf<string>();
      expectTypeOf(result.num).toEqualTypeOf<number>();
      expectTypeOf(result.bool).toEqualTypeOf<boolean>();
      expectTypeOf(result.arr).toEqualTypeOf<string[]>();
      expectTypeOf(result.obj).toEqualTypeOf<{ nested: number }>();
      expectTypeOf(result.extra).toEqualTypeOf<string>();
    });
  });

  describe("Performance and edge cases", () => {
    it("should handle large objects", () => {
      const largeDefaults: Record<string, number> = {};
      const largeState: Record<string, number> = {};

      for (let i = 0; i < 100; i++) {
        largeDefaults[`default_${i}`] = i;
        if (i % 2 === 0) {
          largeState[`state_${i}`] = i * 2;
        }
      }

      const fallbackFn = fallback(largeDefaults);
      const result = fallbackFn(largeState);

      expect(Object.keys(result).length).toBeGreaterThan(100);
      expect(result.default_0).toBe(0);
      expect(result.state_0).toBe(0);
      expect(result.default_1).toBe(1);
      expect(result.state_1).toBeUndefined();
    });

    it("should handle circular references safely", () => {
      const circular: any = { name: "circular" };
      circular.self = circular;

      const state = { value: 42 };

      const fallbackFn = fallback(circular);
      const result = fallbackFn(state);

      expect(result.name).toBe("circular");
      expect(result.value).toBe(42);
      expect(result.self.name).toBe("circular");
    });

    it("should work with prototype inheritance", () => {
      class BaseState {
        baseValue = "base";
      }

      class ExtendedState extends BaseState {
        extendedValue = "extended";
      }

      const defaults = new BaseState();
      const state = new ExtendedState();

      const fallbackFn = fallback(defaults);
      const result = fallbackFn(state);

      expect(result.baseValue).toBe("base");
      expect(result.extendedValue).toBe("extended");
    });
  });

  describe("Functional composition", () => {
    it("should be composable with other functions", () => {
      const defaults1 = { a: 1, b: 2 };
      const defaults2 = { b: 20, c: 3 };

      const state = { a: 10 };

      const fallback1 = fallback(defaults1);
      const fallback2 = fallback(defaults2);

      const result1 = fallback1(state);
      const result2 = fallback2(result1);

      expect(result2).toEqual({
        a: 10,
        b: 2,
        c: 3,
      });
    });

    it("should work with curried usage", () => {
      const createFallbackWithDefaults =
        <Defaults extends GenericObject>(defaults: Defaults) =>
        <State extends GenericObject>(state: State) =>
          fallback(defaults)(state);

      const withUserDefaults = createFallbackWithDefaults({
        name: "Anonymous",
        role: "guest",
      });

      const result = withUserDefaults({ id: 123, name: "John" });

      expect(result).toEqual({
        id: 123,
        name: "John",
        role: "guest",
      });
    });

    it("should maintain immutability", () => {
      const originalDefaults = { count: 0, items: [1, 2, 3] };
      const originalState = { active: true, count: 5 };

      const fallbackFn = fallback(originalDefaults);
      const result = fallbackFn(originalState);

      result.count = 999;
      (result.items as number[]).push(4);

      expect(originalDefaults.count).toBe(0);
      expect(originalDefaults.items).toEqual([1, 2, 3]);
      expect(originalState.count).toBe(5);
    });
  });

  describe("Real-world usage scenarios", () => {
    it("should handle store selector with missing properties", () => {
      const storeState = {
        settings: { theme: "dark" },
        user: { id: 123 },
      };

      const userDefaults = {
        user: {
          email: "guest@example.com",
          id: 0,
          name: "Guest",
        },
      };

      const fallbackFn = fallback(userDefaults);
      const result = fallbackFn(storeState);

      expect(result.user).toEqual({
        email: "guest@example.com",
        id: 123,
        name: "Guest",
      });
      expect(result.settings).toEqual({ theme: "dark" });
    });

    it("should handle configuration merging", () => {
      const defaultConfig = {
        api: { retries: 3, timeout: 5000 },
        features: { newFeature: false },
        ui: { animations: true, theme: "light" },
      };

      const userConfig = {
        api: { timeout: 3000 },
        ui: { theme: "dark" },
      };

      const fallbackFn = fallback(defaultConfig);
      const result = fallbackFn(userConfig);

      expect(result.api).toEqual({ retries: 3, timeout: 3000 });
      expect(result.ui).toEqual({ animations: true, theme: "dark" });
      expect(result.features).toEqual({ newFeature: false });
    });

    it("should handle form default values", () => {
      const formDefaults = {
        age: 0,
        email: "",
        name: "",
        preferences: {
          newsletter: false,
          notifications: true,
        },
      };

      const savedData = {
        name: "John Doe",
        preferences: { newsletter: true },
      };

      const fallbackFn = fallback(formDefaults);
      const result = fallbackFn(savedData);

      expect(result).toEqual({
        age: 0,
        email: "",
        name: "John Doe",
        preferences: { newsletter: true, notifications: true },
      });
    });
  });
});
