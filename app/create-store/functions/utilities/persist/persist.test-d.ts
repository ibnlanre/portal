import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { localAdapter } from "@/create-store/functions/adapters/local-adapter";
import { collection } from "@/create-store/functions/library/collection";
import { primitive } from "@/create-store/functions/library/primitive";

import { persist } from "./index";

type Check<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

// wait, flush
const store = primitive(0);
const persistor = persist(store, localAdapter<number>("n"), { wait: 100 });
export const flushed: Promise<void> = persistor.flush();
// @ts-expect-error wait is milliseconds
persist(store, localAdapter<number>("n"), { wait: "100" });

// onError: the error, and where it happened
persist(store, localAdapter<number>("n"), {
  onError(error, context) {
    const reported: unknown = error;
    const action: "read" | "remove" | "write" = context.action;
    const key: string | undefined = context.key;
    return [reported, action, key];
  },
});
// @ts-expect-error an action is read, write or remove
persist(store, localAdapter<number>("n"), {
  onError: (_error: unknown, context: { action: "other" }) => context,
});

// A collection's persistor knows its entries.
const drafts = collection((id: string) => primitive(id));
const entries = persist(drafts, (id) => localAdapter<string>(`d:${id}`), {
  keys: () => ["a"],
});
export const flag = entries.hydratedOf("a");
export type flagIsBooleanStore = Check<
  Equal<typeof flag, PrimitiveStore<boolean>>
>;
export const stored: Promise<string[] | undefined> = entries.keys();
// @ts-expect-error a key is a string
entries.hydratedOf(1);
export const entryFlush: Promise<void> = entries.flush();

// A single store's persistor does not.
// @ts-expect-error only a collection has entries
persistor.hydratedOf;
// @ts-expect-error only a collection can list keys
persistor.keys;
// @ts-expect-error keys belongs to a collection's persist
persist(store, localAdapter<number>("n"), { keys: () => [] });
