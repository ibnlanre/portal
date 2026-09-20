import { describe, expect, it } from "vitest";

import { createStore } from "../index";

describe("supported ownership boundaries", () => {
  it("owns memory behind SharedArrayBuffer-backed typed views", () => {
    const external = new Uint8Array(new SharedArrayBuffer(4));
    external[0] = 1;
    const store = createStore({ bytes: external });
    external[0] = 2;
    expect(store.bytes.$get()[0]).toBe(1);
    store.bytes.$set((draft) => {
      draft[0] = 3;
      return draft;
    });
    expect(external[0]).toBe(2);
    expect(store.bytes.$get()[0]).toBe(3);
  });

  it("preserves non-enumerable own fields and record prototypes on leaf writes", () => {
    const record = Object.create(null) as {
      hidden: { value: number };
      visible: number;
    };
    Object.defineProperty(record, "hidden", {
      enumerable: false,
      value: { value: 1 },
    });
    record.visible = 0;
    const store = createStore(record);
    store.visible.$set(2);
    expect(store.$get().hidden).toEqual({ value: 1 });
    expect(Object.getPrototypeOf(store.$get())).toBeNull();
    expect(Object.keys(store.$get())).toEqual(["visible"]);
    store.hidden.value.$set(3);
    expect(Object.keys(store.$get())).toEqual(["visible"]);
    expect(store.hidden.value.$get()).toBe(3);
  });

  it("detaches frozen input records so writes never leak into them", () => {
    const input: { nested: { count: number } } = Object.freeze({
      nested: Object.freeze({ count: 1 }),
    });
    const store = createStore({ frozen: input });
    store.frozen.nested.count.$set(2);

    expect(store.frozen.nested.count.$get()).toBe(2);
    expect(input.nested.count).toBe(1);
  });

  it("evaluates accessors once at ingestion and keeps opaque references", () => {
    let reads = 0;
    class Box {
      constructor(public value: number) {}
    }
    const box = new Box(1);
    const action = () => "invoked";
    const store = createStore({
      action,
      box,
      record: {
        get size() {
          reads += 1;
          return { value: 1 };
        },
      },
    });

    expect(store.$get().box).toBe(box);
    expect(store.$get().action).toBe(action);
    store.record.size.value.$set(2);
    expect(store.record.size.value.$get()).toBe(2);
    expect(reads).toBe(1);
  });
});
