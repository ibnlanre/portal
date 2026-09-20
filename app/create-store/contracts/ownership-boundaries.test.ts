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
});
