/**
 * What `persist` needs from an adapter: its `[get, set]` pair. Pass the adapter
 * a factory returned, not a copy of it: only the factory's own tuple is
 * followed. `Written` is what the adapter is given to store (the store's state)
 * and `Read` is what it hands back, which the store must accept as a write; the
 * two differ when the adapter is typed from your own interface, for example one
 * with optional fields where the store's state has `field: T | undefined`.
 */
export type PersistAdapter<Written, Read = Written> = readonly [
  get: () => Promise<Read | undefined> | Read | undefined,
  set: (value?: Written) => unknown,
];
