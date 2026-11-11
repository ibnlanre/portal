import type { StorageWatcher } from "@/create-store/types/storage-watcher";

// Module-private, in the style of `nodeOf`: an adapter factory
// registers the tuple it returns, and `persist` looks the watcher up by that
// very tuple. Weak keys keep an unreferenced tuple collectable. A hand-built
// tuple, or a copy of one, has no entry and so follows nothing.
const watchers = new WeakMap<object, StorageWatcher>();

/**
 * Remembers the watcher of the adapter a factory is returning.
 *
 * @template Adapter The adapter's tuple type.
 * @param adapter The tuple the factory returns.
 * @param watcher Its watcher, if it has one.
 * @returns The adapter, unchanged.
 */
export function registerWatcher<Adapter extends object>(
  adapter: Adapter,
  watcher: StorageWatcher | undefined
): Adapter {
  if (watcher) watchers.set(adapter, watcher);
  return adapter;
}

/**
 * Finds the watcher of an adapter.
 *
 * @param adapter The tuple passed to `persist`.
 * @returns Its watcher, or `undefined` if it did not come from a factory.
 */
export function watcherOf(adapter: object): StorageWatcher | undefined {
  return watchers.get(adapter);
}
