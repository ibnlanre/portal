import type { InferType } from "../types/infer-type";
import type { PrimitiveStore } from "../types/primitive-store";

import { expectTypeOf, it } from "vitest";

import { syncStorage } from "../functions/utilities/sync-storage";
import { createStore } from "../index";

it("exposes read-only snapshots while keeping updater drafts mutable", () => {
  const store = createStore({ tags: ["a"], user: { name: "A" } });
  const snapshot = store.$get();
  expectTypeOf<InferType<typeof store>>().toEqualTypeOf<{
    tags: string[];
    user: { name: string };
  }>();
  expectTypeOf<InferType<PrimitiveStore<{ tags: string[] }>>>().toEqualTypeOf<{
    tags: string[];
  }>();
  expectTypeOf<InferType<PrimitiveStore<() => number>>>().toEqualTypeOf<
    () => number
  >();
  expectTypeOf(snapshot.tags).toEqualTypeOf<readonly string[]>();
  store.$get((state) => {
    expectTypeOf(state).toEqualTypeOf(snapshot);
    return state.user;
  });
  store.$subscribe((state) => expectTypeOf(state).toEqualTypeOf(snapshot));
  // These checks are compile-time only; mutating a snapshot is unsupported.
  if (false) {
    // @ts-expect-error snapshots cannot be assigned to
    snapshot.user.name = "B";
    // @ts-expect-error snapshot arrays have no mutable methods
    snapshot.tags.push("b");
    const [state, set] = store.$use();
    // @ts-expect-error hook snapshots are read-only too
    state.user.name = "B";
    set(snapshot);
    store.$set(snapshot);
    store.tags.$set(snapshot.tags);
    syncStorage(store.tags, "tags", (fallback?: string[]) => fallback);
  }
  store.$set((draft) => {
    draft.user.name = "B";
    draft.tags.push("b");
    return draft;
  });
});
