import { describe, expect, it, vi } from "vitest";

import { fakeBroadcastChannel } from "@/create-store/functions/helpers/channel/fake-broadcast-channel";
import { primitive } from "@/create-store/functions/library/primitive";
import { persist } from "@/create-store/functions/utilities/persist";

import { customAdapter } from "./index";

type Draft = { note: string };

function source() {
  const data = new Map<string, string>();
  const stop = vi.fn();
  let listen: (change: { removed: boolean }) => void = () => {};
  const adapter = customAdapter<Draft>("draft", {
    getItem: (key) => data.get(key) ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
    watch: (listener) => {
      listen = listener;
      return stop;
    },
  });
  return {
    adapter,
    data,
    emit: (removed: boolean) => listen({ removed }),
    stop,
  };
}

describe("customAdapter watch", () => {
  it("follows the function it was given, and writes nothing back", () => {
    const { adapter, data, emit } = source();
    const store = primitive<Draft>({ note: "" });
    persist(store, adapter);

    data.set("draft", JSON.stringify({ note: "elsewhere" }));
    emit(false);

    expect(store.$get()).toEqual({ note: "elsewhere" });
    expect(data.get("draft")).toBe(JSON.stringify({ note: "elsewhere" }));
  });

  it("resets to the initial value when the source reports a removal", () => {
    const { adapter, data, emit } = source();
    const initial: Draft = { note: "" };
    const store = primitive<Draft>(initial);
    persist(store, adapter);
    data.set("draft", JSON.stringify({ note: "x" }));
    emit(false);
    data.delete("draft");
    emit(true);
    expect(store.$get()).toBe(initial);
  });

  it("stops listening when the persistor is disposed", () => {
    const { adapter, stop } = source();
    const persistor = persist(primitive<Draft>({ note: "" }), adapter);
    persistor.dispose();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("announces nothing of its own", () => {
    const fake = fakeBroadcastChannel();
    const { adapter } = source();
    const store = primitive<Draft>({ note: "" });
    persist(store, adapter);
    store.$set({ note: "mine" });
    expect(fake.open.size).toBe(0);
  });

  it("without watch the adapter follows nothing", () => {
    const data = new Map<string, string>();
    const adapter = customAdapter<Draft>("draft", {
      getItem: (key) => data.get(key) ?? null,
      removeItem: (key) => void data.delete(key),
      setItem: (key, value) => void data.set(key, value),
    });
    const store = primitive<Draft>({ note: "" });
    expect(() => persist(store, adapter)).not.toThrow();
  });
});
