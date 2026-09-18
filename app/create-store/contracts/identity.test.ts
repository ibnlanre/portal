import { describe, expect, it } from "vitest";
import { createStore } from "../index";

describe("branch identity contract", () => {
  it.each(["a", "b"] as const)(
    "isolates aliased branches after accessing %s first",
    (first) => {
      const shared = { value: "initial" };
      const store = createStore({ a: shared, b: shared });
      const other = first === "a" ? "b" : "a";
      expect(store[first].value.$get()).toBe("initial");
      store[other].value.$set("changed");
      expect(store[first].value.$get()).toBe("initial");
      expect(store[other].value.$get()).toBe("changed");
      expect(shared.value).toBe("initial");
    }
  );

  it.each(["left", "right"] as const)(
    "isolates deep aliases after accessing %s first",
    (first) => {
      const shared = { nested: { value: 0 } };
      const store = createStore({
        left: { child: shared },
        right: { child: shared },
      });
      const other = first === "left" ? "right" : "left";
      const retained = store[first].child.nested;
      store.$at(`${other}.child.nested.value`).$set(1);
      expect(retained.value.$get()).toBe(0);
      expect(store[other].child.nested.value.$get()).toBe(1);
    }
  );

  it("keeps dot and path handles stable across writes, including leaves", () => {
    const store = createStore({ user: { name: "A" } });
    const user = store.user;
    const name = user.name;
    expect(store.$at("user")).toBe(user);
    expect(store.$at("user.name")).toBe(name);
    user.$set({ name: "B" });
    expect(store.user).toBe(user);
    expect(store.user.name).toBe(name);
    expect(name.$get()).toBe("B");
  });
});
