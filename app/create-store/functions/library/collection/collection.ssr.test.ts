import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { composite } from "@/create-store/functions/library/composite";

import { collection } from "./index";

describe("collection on the server", () => {
  it("makes, reads, writes, subscribes and deletes entries without a window", () => {
    const drafts = collection((id: string) => composite({ note: id }));
    const listener = vi.fn();
    drafts.$subscribe(listener, { immediate: false });
    drafts("a").note.$set("x");
    drafts.$set({ b: { note: "y" } });
    expect(drafts.$keys()).toEqual(["a", "b"]);
    expect(drafts.$get()).toEqual({ a: { note: "x" }, b: { note: "y" } });
    drafts.$delete("a");
    drafts.$clear();
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it("renders an entry created during the render", () => {
    const drafts = collection((id: string) =>
      composite({ note: `note ${id}` })
    );
    function Note() {
      const [note] = drafts("acme").note.$use();
      return createElement("p", null, note);
    }
    expect(renderToString(createElement(Note))).toContain("note acme");
  });
});
