import { render } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { localAdapter } from "@/create-store/functions/adapters/local-adapter";
import { batch } from "@/create-store/functions/helpers/batch";
import { composite } from "@/create-store/functions/library/composite";
import { primitive } from "@/create-store/functions/library/primitive";
import { persist } from "@/create-store/functions/utilities/persist";

import { collection } from "./index";

type Entry = { note: string };

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

function make() {
  return collection((id: string) =>
    primitive<Entry>({ note: `initial ${id}` })
  );
}

describe("collection removal resets, then disposes", () => {
  it("$delete resets the held entry, notifies each subscriber once, and leaves the others", () => {
    const drafts = make();
    const a = drafts("a");
    const b = drafts("b");
    a.$set({ note: "edited" });
    b.$set({ note: "kept" });
    const onCollection = vi.fn();
    const onA = vi.fn();
    const onB = vi.fn();
    drafts.$subscribe(onCollection, { immediate: false });
    a.$subscribe(onA, { immediate: false });
    b.$subscribe(onB, { immediate: false });

    drafts.$delete("a");

    expect(a.$get()).toEqual({ note: "initial a" });
    expect(onCollection).toHaveBeenCalledTimes(1);
    expect(onA).toHaveBeenCalledTimes(1);
    expect(onA).toHaveBeenCalledWith({ note: "initial a" });
    expect(b.$get()).toEqual({ note: "kept" });
    // A write to the collection is heard by its entries too, with their value.
    expect(onB).toHaveBeenCalledWith({ note: "kept" });
    expect(drafts.$has("a")).toBe(false);
    a.$set({ note: "ignored" });
    expect(a.$get()).toEqual({ note: "initial a" });
  });

  it("$clear does the same for every entry, in one delivery", () => {
    const drafts = make();
    const a = drafts("a");
    const b = drafts("b");
    a.$set({ note: "x" });
    b.$set({ note: "y" });
    const onCollection = vi.fn();
    const onA = vi.fn();
    drafts.$subscribe(onCollection, { immediate: false });
    a.$subscribe(onA, { immediate: false });

    drafts.$clear();

    expect(a.$get()).toEqual({ note: "initial a" });
    expect(b.$get()).toEqual({ note: "initial b" });
    expect(onCollection).toHaveBeenCalledTimes(1);
    expect(onA).toHaveBeenCalledTimes(1);
    expect(drafts.$keys()).toEqual([]);
  });

  it("inside batch the delivery is still one", () => {
    const drafts = make();
    drafts("a").$set({ note: "x" });
    const onCollection = vi.fn();
    drafts.$subscribe(onCollection, { immediate: false });
    batch(() => {
      drafts.$delete("a");
      drafts("b");
      drafts.$clear();
    });
    expect(onCollection).toHaveBeenCalledTimes(1);
  });

  it("a composite entry is reset branch by branch", () => {
    const drafts = collection((id: string) =>
      composite({ lines: primitive<string[]>([]), note: id })
    );
    const entry = drafts("a");
    entry.note.$set("edited");
    drafts.$delete("a");
    expect(entry.$get()).toEqual({ lines: [], note: "a" });
  });

  it("a mounted component holding an entry shows the initial state after $clear", () => {
    const drafts = make();
    const entry = drafts("a");
    entry.$set({ note: "typing" });
    function View() {
      const [state] = entry.$use();
      return <p>{state.note}</p>;
    }
    const view = render(<View />);
    expect(view.container.textContent).toBe("typing");

    act(() => drafts.$clear());

    expect(view.container.textContent).toBe("initial a");
    expect(drafts("a")).not.toBe(entry);
  });

  it("direct entry.$dispose() keeps the last value", () => {
    const drafts = make();
    const entry = drafts("a");
    entry.$set({ note: "edited" });
    entry.$dispose();
    expect(entry.$get()).toEqual({ note: "edited" });
  });
});

describe("a persisted collection", () => {
  const key = (id: string) => `draft:${id}`;
  const adapterFor = (id: string) => localAdapter<Entry>(key(id));

  it("$delete removes the stored key and writes nothing back", () => {
    const drafts = make();
    persist(drafts, adapterFor);
    const a = drafts("a");
    const b = drafts("b");
    a.$set({ note: "saved" });
    b.$set({ note: "other" });
    const setItem = vi.spyOn(localStorage, "setItem");
    const removeItem = vi.spyOn(localStorage, "removeItem");

    drafts.$delete("a");

    expect(a.$get()).toEqual({ note: "initial a" });
    expect(localStorage.getItem(key("a"))).toBeNull();
    expect(removeItem).toHaveBeenCalledWith(key("a"));
    expect(setItem).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(key("b"))!)).toEqual({
      note: "other",
    });
  });

  it("$clear removes every stored key and writes nothing back", () => {
    const drafts = make();
    persist(drafts, adapterFor);
    drafts("a").$set({ note: "1" });
    drafts("b").$set({ note: "2" });
    const setItem = vi.spyOn(localStorage, "setItem");

    drafts.$clear();

    expect(localStorage.getItem(key("a"))).toBeNull();
    expect(localStorage.getItem(key("b"))).toBeNull();
    expect(setItem).not.toHaveBeenCalled();
  });

  it("a later drafts('a') is fresh and hydrates from the now absent storage", () => {
    const drafts = make();
    persist(drafts, adapterFor);
    drafts("a").$set({ note: "saved" });
    drafts.$clear();

    const again = drafts("a");

    expect(again.$get()).toEqual({ note: "initial a" });
    again.$set({ note: "new" });
    expect(JSON.parse(localStorage.getItem(key("a"))!)).toEqual({
      note: "new",
    });
  });

  it("entry.$dispose() leaves the stored key", () => {
    const drafts = make();
    persist(drafts, adapterFor);
    const entry = drafts("a");
    entry.$set({ note: "saved" });
    entry.$dispose();
    expect(JSON.parse(localStorage.getItem(key("a"))!)).toEqual({
      note: "saved",
    });
  });

  it("an adapter whose removal throws is reported and does not stop the removal", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const drafts = make();
    persist(drafts, () => [
      () => undefined,
      (value?: Entry) => {
        if (value === undefined) throw new Error("no");
      },
    ]);
    const entry = drafts("a");
    expect(() => drafts.$delete("a")).not.toThrow();
    expect(error).toHaveBeenCalled();
    expect(drafts.$has("a")).toBe(false);
    expect(entry.$get()).toEqual({ note: "initial a" });
  });
});
