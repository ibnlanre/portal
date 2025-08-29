import { describe, expect, it } from "vitest";

import { isAtomic } from "@/create-store/functions/assertions/is-atomic";
import { atom } from "@/create-store/functions/library/atom";

import { createPrimitiveStore } from "../create-primitive-store";
import { createCompositeStore } from "./index";

describe("createCompositeStore - Value Object Behavior", () => {
  describe("atomic utility", () => {
    it("should mark an object as a value object", () => {
      const obj = { language: "en", theme: "dark" };
      const marked = atom(obj);

      expect(isAtomic(marked)).toBe(true);
      expect(marked).toBe(obj); // Should return the same object
    });

    it("should be idempotent - calling atomic multiple times should be safe", () => {
      const obj = { theme: "dark" };
      const marked1 = atom(obj);
      const marked2 = atom(marked1);

      expect(marked1).toBe(marked2);
      expect(isAtomic(marked2)).toBe(true);
    });

    it("should not affect object enumeration", () => {
      const obj = { language: "en", theme: "dark" };
      const marked = atom(obj);

      expect(Object.keys(marked)).toEqual(["theme", "language"]);
      expect(Object.values(marked)).toEqual(["dark", "en"]);
    });
  });

  describe("Value object vs regular object behavior", () => {
    it("should do partial updates for regular objects", () => {
      const store = createCompositeStore({
        settings: {
          brightness: 80,
          volume: 50,
        },
      });

      // Update only volume, brightness should be preserved
      store.settings.$set({ volume: 75 });

      expect(store.settings.$get()).toEqual({
        brightness: 80,
        volume: 75,
      });
    });

    it("should do complete replacement for value objects", () => {
      const store = createCompositeStore({
        preferences: atom({
          language: "en",
          notifications: true,
          theme: "dark",
        }),
      });

      // Replace entire preferences object
      store.preferences.$set({ theme: "light" });

      expect(store.preferences.$get()).toEqual({
        theme: "light",
      });
      // language and notifications should be cleared
    });

    it("should handle mixed scenarios - regular and value objects together", () => {
      const store = createCompositeStore({
        user: {
          name: "John",
          preferences: atom({
            language: "en",
            notifications: true,
            theme: "dark",
          }),
          settings: {
            brightness: 80,
            volume: 50,
          },
        },
      });

      // Update regular object (partial)
      store.user.settings.$set({ volume: 75 });
      expect(store.user.settings.$get()).toEqual({
        brightness: 80,
        volume: 75,
      });

      // Update value object (complete replacement)
      store.user.preferences.$set({ language: "fr", theme: "light" });
      expect(store.user.preferences.$get()).toEqual({
        language: "fr",
        theme: "light",
      });
      // notifications should be cleared

      // Name should remain unchanged
      expect(store.user.name.$get()).toBe("John");
    });
  });

  describe("Proxy behavior for value objects", () => {
    it("should return value objects directly, not as store proxies", () => {
      const store = createCompositeStore({
        preferences: atom({
          language: "en",
          theme: "dark",
        }),
        settings: {
          volume: 50,
        },
      });

      const preferences = store.preferences;
      const settings = store.settings;

      preferences.$get().theme;
      settings.$get().volume;

      // Value object should be returned directly
      expect(typeof preferences).toBe("object");
      expect("$get" in preferences).toBe(false);
      expect("$set" in preferences).toBe(false);
      expect(preferences).toEqual({ language: "en", theme: "dark" });

      // Regular object should be a store proxy
      expect("$get" in settings).toBe(true);
      expect("$set" in settings).toBe(true);
    });

    it("should allow direct property access on value objects", () => {
      const store = createCompositeStore({
        preferences: atom({
          language: "en",
          theme: "dark",
        }),
      });

      const preferences = store.preferences.$get();

      expect(preferences.theme).toBe("dark");
      expect(preferences.language).toBe("en");
    });
  });

  describe("Nested value objects", () => {
    it("should handle value objects nested within regular objects", () => {
      const store = createCompositeStore({
        user: {
          profile: {
            name: "John",
            preferences: atom({
              language: "en",
              theme: "dark",
            }),
          },
        },
      });

      store.user.profile.name.$get();
      store.user.profile.preferences.$get().theme;

      // Update nested value object
      store.user.profile.preferences.$set(atom({ theme: "light" }));

      expect(store.user.profile.preferences.$get()).toEqual({
        theme: "light",
      });

      // Other properties should remain
      expect(store.user.profile.name.$get()).toBe("John");
    });

    it("should handle value objects containing regular objects", () => {
      const store = createCompositeStore({
        config: atom({
          api: {
            timeout: 5000,
          },
          ui: {
            sidebar: "collapsed",
            theme: "dark",
          },
        }),
      });

      // Replace entire config (value object behavior)
      store.config.$set({
        ui: {
          theme: "light",
        },
      });

      expect(store.config.$get()).toEqual({
        ui: {
          theme: "light",
        },
      });
    });
  });

  describe("Function-based updates with value objects", () => {
    it("should work with function-based updates for value objects", () => {
      const store = createCompositeStore({
        preferences: atom({
          language: "en",
          theme: "dark",
        }),
      });

      // Function-based update should still do complete replacement for value objects
      store.preferences.$set((current) => {
        expect(current).toEqual({ language: "en", theme: "dark" });
        return { fontSize: 14, theme: "light" };
      });

      expect(store.preferences.$get()).toEqual({
        fontSize: 14,
        theme: "light",
      });
      // language should be cleared
    });

    it("should work with function-based updates for regular objects", () => {
      const store = createCompositeStore({
        settings: {
          brightness: 80,
          volume: 50,
        },
      });

      // Function-based update should still do partial replacement for regular objects
      store.settings.$set((current) => {
        expect(current).toEqual({ brightness: 80, volume: 50 });
        return { volume: 75 };
      });

      expect(store.settings.$get()).toEqual({
        brightness: 80,
        volume: 75,
      });
      // brightness should be preserved
    });
  });

  describe("Edge cases", () => {
    it("should handle empty value objects", () => {
      const store = createCompositeStore({
        empty: atom({}),
      });

      expect(store.empty.$get()).toEqual({});

      store.empty.$set(atom({ newProp: "value" }));
      expect(store.empty.$get()).toEqual({ newProp: "value" });
    });

    it("should handle setting non-value object to value object path", () => {
      const store = createCompositeStore({
        preferences: atom<{
          language: string;
          theme: string;
        }>({}),
      });

      const preferences = createPrimitiveStore(
        atom<{ language: string; theme: string }>({
          theme: "dark",
        })
      );

      preferences.$set({ language: "en" });
      store.preferences.$set({ language: "en", theme: "light" });

      preferences.$get().language;
      store.preferences.$get().language;

      expect(store.preferences.$get()).toEqual({
        theme: "light",
      });
    });
  });
});
