import { render } from "@testing-library/react";
import { act, StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";

import { batch } from "@/create-store/functions/helpers/batch";
import { composite } from "@/create-store/functions/library/composite";
import { primitive } from "@/create-store/functions/library/primitive";

import { collection } from "./index";

type Line = { sku: string };

function drafts() {
  const make = vi.fn((_organisation: string) =>
    composite({ lines: primitive<Line[]>([]), note: "" })
  );
  return { drafts: collection(make), make };
}

describe("collection", () => {
  it("makes an entry on first use, once", () => {
    const { drafts: store, make } = drafts();
    expect(make).not.toHaveBeenCalled();
    const entry = store("acme");
    expect(store("acme")).toBe(entry);
    expect(make).toHaveBeenCalledTimes(1);
    expect(entry.lines.$get()).toEqual([]);
  });

  it("keys are strings: a numeric id is converted at the call site", () => {
    const byId = collection((key: string) => primitive(key));
    expect(byId(String(1))).toBe(byId("1"));
    expect(byId.$keys()).toEqual(["1"]);
    // @ts-expect-error a number is not a key
    expect(() => byId(1)).not.toThrow();
  });

  it("reports has and keys, and its state is the entries that exist", () => {
    const { drafts: store } = drafts();
    expect(store.$has("acme")).toBe(false);
    store("acme");
    store("zed");
    expect(store.$has("acme")).toBe(true);
    expect(store.$keys()).toEqual(["acme", "zed"]);
    expect(Object.keys(store.$get())).toEqual(["acme", "zed"]);
  });

  it("deletes an entry, disposing it, and clears all", () => {
    const { drafts: store } = drafts();
    const acme = store("acme");
    const cleanup = vi.fn();
    acme.$onDispose(cleanup);
    store("zed");

    store.$delete("acme");
    store.$delete("missing");
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(store.$has("acme")).toBe(false);
    expect(store("acme")).not.toBe(acme);

    store.$clear();
    expect(store.$keys()).toEqual([]);
  });

  it("does not notify when an entry is made by reading", () => {
    const { drafts: store } = drafts();
    const listener = vi.fn();
    store.$subscribe(listener, { immediate: false });
    store("acme");
    expect(listener).not.toHaveBeenCalled();
    expect(Object.keys(store.$get())).toEqual(["acme"]);
  });

  it("notifies when an entry's own value changes, and on delete and clear", () => {
    const { drafts: store } = drafts();
    const listener = vi.fn();
    const entry = store("acme");
    store.$subscribe(listener, { immediate: false });

    entry.note.$set("hello");
    expect(listener).toHaveBeenCalledTimes(1);

    store.$delete("acme");
    expect(listener).toHaveBeenCalledTimes(2);

    store("zed");
    store.$clear();
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("merges a record into entries, making missing ones, and notifies", () => {
    const { drafts: store } = drafts();
    store("old").note.$set("keep");
    const listener = vi.fn();
    store.$subscribe(listener, { immediate: false });

    store.$set({ acme: { note: "n" } });

    expect(store("acme").note.$get()).toBe("n");
    expect(store("old").note.$get()).toBe("keep");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("creates the entries a record lists, and removing is explicit", () => {
    const { drafts: store } = drafts();
    store("old");
    store.$set({ acme: { note: "n" }, zed: { note: "z" } });
    expect(store.$keys()).toEqual(["old", "acme", "zed"]);
    expect(store("acme").note.$get()).toBe("n");

    batch(() => {
      store.$clear();
      store.$set({ acme: { note: "again" } });
    });
    expect(store.$keys()).toEqual(["acme"]);
    expect(store("acme").note.$get()).toBe("again");
  });

  it("resets by disposing every entry", () => {
    const { drafts: store } = drafts();
    store("a");
    store("b");
    store.$reset();
    expect(store.$keys()).toEqual([]);
  });

  it("keeps $get stable until something changes", () => {
    const { drafts: store } = drafts();
    store("a");
    const first = store.$get();
    expect(store.$get()).toBe(first);
    store("a").note.$set("x");
    expect(store.$get()).not.toBe(first);
  });

  it("disposes its entries with it, and refuses new ones", () => {
    const { drafts: store } = drafts();
    const cleanup = vi.fn();
    store("a").$onDispose(cleanup);
    store.$dispose();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(() => store("b")).toThrow(/disposed/);
    expect(Object.keys(store.$get())).toEqual(["a"]);
  });

  it("drops an entry that is disposed on its own, and announces it once", () => {
    const { drafts: store } = drafts();
    const entry = store("a");
    store("b");
    const app = composite({ drafts: store });
    const heard = vi.fn();
    const heardByHolder = vi.fn();
    store.$subscribe(heard, { immediate: false });
    app.$subscribe(heardByHolder, { immediate: false });

    entry.$dispose();

    expect(store.$has("a")).toBe(false);
    expect(store("a")).not.toBe(entry);
    expect(heard).toHaveBeenCalledTimes(1);
    expect(heardByHolder).toHaveBeenCalledTimes(1);
    expect(Object.keys(heard.mock.calls[0][0])).toEqual(["b"]);
  });

  it("joins a batch when an entry is disposed inside it", () => {
    const { drafts: store } = drafts();
    const entry = store("a");
    const heard = vi.fn();
    store.$subscribe(heard, { immediate: false });
    batch(() => {
      entry.$dispose();
      store("b").note.$set("x");
    });
    expect(heard).toHaveBeenCalledTimes(1);
  });

  it("disposing the collection does not announce its entries leaving", () => {
    const { drafts: store } = drafts();
    store("a");
    const heard = vi.fn();
    store.$subscribe(heard, { immediate: false });
    store.$dispose();
    expect(heard).not.toHaveBeenCalled();
  });

  it("sits in a composite, notifying it", () => {
    const { drafts: store } = drafts();
    const app = composite({ drafts: store });
    const listener = vi.fn();
    app.$subscribe(listener, { immediate: false });
    app.drafts("acme").note.$set("x");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(app.$get().drafts.acme.note).toBe("x");
  });

  it("raises no warning when an entry is made during a render of a subscribed component", () => {
    const { drafts: store } = drafts();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    function Child() {
      const [note] = store("acme").note.$use();
      return <span>{note || "empty"}</span>;
    }
    function Parent() {
      const [state] = store.$use();
      return (
        <div>
          <span>{Object.keys(state).length}</span>
          <Child />
        </div>
      );
    }

    const view = render(<Parent />);
    expect(view.getByText("empty")).toBeTruthy();
    act(() => store("acme").note.$set("hi"));
    expect(view.getByText("hi")).toBeTruthy();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("raises no warning for an entry created during a StrictMode render", () => {
    const { drafts: store } = drafts();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    function Note() {
      const [note] = store("acme").note.$use();
      return <span>{note || "empty"}</span>;
    }
    const view = render(
      <StrictMode>
        <Note />
      </StrictMode>
    );
    expect(view.getByText("empty")).toBeTruthy();
    act(() => store("acme").note.$set("hi"));
    expect(view.getByText("hi")).toBeTruthy();
    expect(store.$keys()).toEqual(["acme"]);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
