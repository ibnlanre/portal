import { renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { primitive } from "./index";

describe("primitive", () => {
  describe("reads", () => {
    it("returns the very reference it was given, uncopied", () => {
      const value = { at: new Date(0), list: [1] };
      const store = primitive(value);
      expect(store.$get()).toBe(value);
    });

    it("accepts an initializer", () => {
      expect(primitive(() => 5).$get()).toBe(5);
    });

    it("selects from the value", () => {
      const store = primitive({ a: 1, b: 2 });
      expect(store.$get((state) => state.b)).toBe(2);
    });

    it("exposes only non-enumerable members", () => {
      const store = primitive(1);
      expect(Object.keys(store)).toEqual([]);
      for (const name of [
        "$get",
        "$use",
        "$set",
        "$subscribe",
        "$reset",
        "$dispose",
        "$onDispose",
      ]) {
        expect((store as never)[name]).toBeTypeOf("function");
      }
    });
  });

  describe("$set", () => {
    it("swaps the whole value and never merges objects", () => {
      const store = primitive<{ a?: number; b?: number }>({ a: 1, b: 2 });
      store.$set({ a: 3 });
      expect(store.$get()).toEqual({ a: 3 });
    });

    it("keeps the given reference", () => {
      const store = primitive<{ n: number }>({ n: 1 });
      const next = { n: 2 };
      store.$set(next);
      expect(store.$get()).toBe(next);
    });

    it("passes the current value to an updater, which returns a new one", () => {
      const store = primitive(1);
      store.$set((count) => count + 1);
      expect(store.$get()).toBe(2);
    });

    it("publishes nothing when the updater throws", () => {
      const store = primitive(1);
      const listener = vi.fn();
      store.$subscribe(listener, { immediate: false });
      expect(() =>
        store.$set(() => {
          throw new Error("no");
        })
      ).toThrow("no");
      expect(store.$get()).toBe(1);
      expect(listener).not.toHaveBeenCalled();
    });

    it("swaps an object leaf whole, whatever its shape", () => {
      const store = primitive<{ a?: number; nested?: { b: number } }>({
        a: 1,
        nested: { b: 2 },
      });
      store.$set({ nested: { b: 3 } });
      expect(store.$get()).toEqual({ nested: { b: 3 } });
    });
  });

  describe("$subscribe", () => {
    it("delivers the current value at once unless told not to", () => {
      const store = primitive(1);
      const now = vi.fn();
      const later = vi.fn();
      store.$subscribe(now);
      store.$subscribe(later, { immediate: false });
      expect(now).toHaveBeenCalledWith(1);
      expect(later).not.toHaveBeenCalled();
    });

    it("notifies on every write, even for an equal value", () => {
      const store = primitive(1);
      const listener = vi.fn();
      store.$subscribe(listener, { immediate: false });
      store.$set(1);
      store.$set(2);
      expect(listener.mock.calls).toEqual([[1], [2]]);
    });

    it("stops after unsubscribe, which is idempotent", () => {
      const store = primitive(1);
      const listener = vi.fn();
      const off = store.$subscribe(listener, { immediate: false });
      off();
      off();
      store.$set(2);
      expect(listener).not.toHaveBeenCalled();
    });

    it("removes a subscriber whose immediate call throws", () => {
      const store = primitive(1);
      const listener = vi.fn(() => {
        throw new Error("boom");
      });
      expect(() => store.$subscribe(listener)).toThrow("boom");
      listener.mockClear();
      store.$set(2);
      expect(listener).not.toHaveBeenCalled();
    });

    it("delivers writes made by a subscriber in order", () => {
      const store = primitive(0);
      const seen: number[] = [];
      store.$subscribe(
        (value) => {
          seen.push(value);
          if (value === 1) store.$set(2);
        },
        { immediate: false }
      );
      store.$set(1);
      expect(seen).toEqual([1, 2]);
    });
  });

  describe("$reset", () => {
    it("returns to the initial reference and notifies", () => {
      const initial = { n: 1 };
      const store = primitive(initial);
      store.$set({ n: 2 });
      const listener = vi.fn();
      store.$subscribe(listener, { immediate: false });
      store.$reset();
      expect(store.$get()).toBe(initial);
      expect(listener).toHaveBeenCalledWith(initial);
    });
  });

  describe("$dispose and $onDispose", () => {
    it("drops subscribers, ignores writes, and keeps the last value", () => {
      const store = primitive(1);
      const listener = vi.fn();
      store.$subscribe(listener, { immediate: false });
      store.$dispose();
      store.$dispose();
      store.$set(2);
      store.$reset();
      expect(listener).not.toHaveBeenCalled();
      expect(store.$get()).toBe(1);
    });

    it("runs a registered cleanup once, and not after it is removed", () => {
      const store = primitive(1);
      const kept = vi.fn();
      const removed = vi.fn();
      store.$onDispose(kept);
      store.$onDispose(removed)();
      store.$dispose();
      store.$dispose();
      expect(kept).toHaveBeenCalledTimes(1);
      expect(removed).not.toHaveBeenCalled();
    });

    it("runs a cleanup registered after disposal at once", () => {
      const store = primitive(1);
      store.$dispose();
      const cleanup = vi.fn();
      store.$onDispose(cleanup);
      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it("lets a late subscriber read once without registering", () => {
      const store = primitive(1);
      store.$dispose();
      const listener = vi.fn();
      store.$subscribe(listener)();
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("$use", () => {
    it("reads, selects and re-renders on a write", () => {
      const store = primitive({ a: 1, b: 1 });
      const { result } = renderHook(() => store.$use((state) => state.a));
      expect(result.current[0]).toBe(1);
      act(() => result.current[1]({ a: 2, b: 1 }));
      expect(result.current[0]).toBe(2);
    });

    it("does not re-render for an unchanged selection", () => {
      const store = primitive({ a: 1, b: 1 });
      let renders = 0;
      renderHook(() => {
        renders++;
        return store.$use((state) => state.a);
      });
      const before = renders;
      act(() => store.$set({ a: 1, b: 2 }));
      expect(renders).toBe(before);
    });
  });
});
