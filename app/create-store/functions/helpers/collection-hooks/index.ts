import type { CollectionHooks } from "@/create-store/types/collection-hooks";

const collections = new WeakMap<object, CollectionHooks>();

/**
 * Finds the hooks of a collection.
 *
 * @param store Anything.
 * @returns The hooks, or `undefined` for any other store.
 */
export function collectionHooks(store: unknown): CollectionHooks | undefined {
  if (store === null) return undefined;
  if (typeof store !== "object" && typeof store !== "function") {
    return undefined;
  }
  return collections.get(store);
}

/**
 * Remembers the hooks of a collection.
 *
 * @param store The collection's public object.
 * @param hooks Its entries and a way to hear of new ones.
 */
export function registerCollection(store: object, hooks: CollectionHooks) {
  collections.set(store, hooks);
}
