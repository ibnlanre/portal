// Module-private, in the style of `nodeOf`: `ref` registers what it makes so a
// composite can tell a ref from a plain value without touching its shape.
const refs = new WeakSet<object>();

/**
 * Checks for a ref.
 *
 * @param value Anything.
 * @returns `true` if the value was made by `ref`.
 */
export function isRef(value: unknown): boolean {
  if (value === null) return false;
  if (typeof value !== "object" && typeof value !== "function") return false;
  return refs.has(value);
}

/**
 * Remembers a ref.
 *
 * @param store The object `ref` is returning.
 * @returns The store, unchanged.
 */
export function registerRef<Store extends object>(store: Store): Store {
  refs.add(store);
  return store;
}
