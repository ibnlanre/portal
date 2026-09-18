import type { Snapshot } from "@/create-store/types/snapshot";

/**
 * @template State
 *
 * @description
 * Listens for cross-tab `storage` events and syncs the value into the store
 * when the matching key changes in another tab. Removal restores the baseline
 * captured at registration through normal $set semantics (objects deep-merge;
 * omitted keys are retained).
 * Returns an idempotent cleanup function. SSR-safe — no-ops when
 * `window` is not available.
 *
 * @param store A store with an `$set` method.
 * @param key   The localStorage key to watch.
 * @param get   A function to read the current value from storage.
 *
 * @example
 * ```ts
 * const [getCount, setCount] = createLocalStorageAdapter("count");
 * const store = createStore(getCount(0));
 *
 * syncStorage(store, "count", getCount);
 * ```
 */
export function syncStorage<State>(
  store: {
    $get: () => Snapshot<State>;
    $set: (value: Snapshot<State> | State) => void;
  },
  key: string,
  get: (fallback?: State) => State | undefined
): () => void {
  if (typeof window === "undefined") return () => {};

  const initial = store.$get();

  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== key) return;
    if (event.storageArea && event.storageArea !== window.localStorage) return;

    const value = get(undefined);
    store.$set(value === undefined ? initial : value);
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
