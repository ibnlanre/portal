/**
 * @template State
 *
 * @description
 * Listens for cross-tab `storage` events and syncs the value into the store
 * when the matching key changes in another tab. SSR-safe — no-ops when
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
  store: { $set: (value: State) => void },
  key: string,
  get: (fallback?: State) => State | undefined
): void {
  if (typeof window === "undefined") return;

  window.addEventListener("storage", (event) => {
    if (event.key !== key) return;

    const value = get(undefined);
    if (value !== undefined) store.$set(value);
  });
}
