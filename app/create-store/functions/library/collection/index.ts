import type { AnyStore } from "@/create-store/types/any-store";
import type { CollectionEntry } from "@/create-store/types/collection-entry";
import type { CollectionStore } from "@/create-store/types/collection-store";
import type { StoreNode } from "@/create-store/types/store-node";

import { after, write } from "@/create-store/functions/helpers/batch";
import { registerCollection } from "@/create-store/functions/helpers/collection-hooks";
import { connect, disconnect } from "@/create-store/functions/helpers/connect";
import { createDisposer } from "@/create-store/functions/helpers/create-disposer";
import { defineStore } from "@/create-store/functions/helpers/define-store";
import { disposeNode } from "@/create-store/functions/helpers/dispose-node";
import { markStale } from "@/create-store/functions/helpers/mark-stale";
import { nodeOf } from "@/create-store/functions/helpers/nodes";

/**
 * Branches made by key. `drafts("acme")` makes the entry on first use, without
 * notifying anyone, so reading never causes an update. Keys are strings.
 * Explicit writes (`$set`, `$reset`, `$delete`, `$clear`) notify.
 */
export function collection<Entry extends AnyStore>(
  make: (key: string) => Entry
): CollectionStore<Entry> {
  const entries = new Map<string, CollectionEntry>();
  const listeners = new Set<(key: string, store: AnyStore) => void>();
  const removers = new Set<(key: string, store: AnyStore) => void>();

  let cache: Record<string, unknown> | undefined;
  let fresh = false;
  let frozen = false;

  const node: StoreNode = {
    api: {},
    children: () => Array.from(entries.values(), (entry) => entry.node),
    disposeChildren() {
      // Keep the last value readable once the entries are gone.
      node.read();
      frozen = true;

      for (const entry of entries.values()) {
        disconnect(node, entry.node);
        disposeNode(entry.node);
      }

      entries.clear();
    },
    disposed: false,
    disposer: createDisposer(),
    holders: new Set(),
    kind: "collection",
    listeners: new Set(),
    read() {
      if ((fresh || frozen) && cache) return cache;
      const next: Record<string, unknown> = {};

      let same = cache !== undefined;
      let count = 0;

      for (const [id, entry] of entries) {
        const value = entry.node.read();
        next[id] = value;
        count++;

        if (
          same &&
          !(Object.hasOwn(cache!, id) && Object.is(cache![id], value))
        ) {
          same = false;
        }
      }

      if (same && Object.keys(cache!).length !== count) same = false;
      if (!same) cache = next;

      fresh = true;
      return cache!;
    },
    stale() {
      const was = fresh;
      fresh = false;
      return was;
    },
  };

  function entryFor(id: string): CollectionEntry {
    const existing = entries.get(id);
    if (existing) return existing;
    if (node.disposed) throw new Error("collection: it is disposed.");

    const store = make(id);
    const child = nodeOf(store);

    if (!child) throw new TypeError("collection: make must return a store.");
    for (const listener of listeners) listener(id, store);
    connect(node, child);

    const entry: CollectionEntry = { node: child, store };
    entries.set(id, entry);

    // An entry disposed on its own is no longer an entry; the next use makes a
    // fresh one.
    store.$onDispose(() => {
      if (entries.get(id) !== entry) return;

      const drop = () => {
        entries.delete(id);
        disconnect(node, child);
        fresh = false;
        markStale(node);
      };

      // Disposing the collection removes its entries silently; any other
      // disposal of an entry is a change the collection announces.
      if (node.disposed) drop();
      else write(node, drop);
    });

    fresh = false;
    markStale(node);

    return entry;
  }

  function remove(id: string) {
    const entry = entries.get(id);
    if (!entry) return;

    // A removal is not an edit: the entry goes back to its initial value, so
    // whoever holds it sees the empty state, and then ends.
    for (const listener of removers) listener(id, entry.store);
    entries.delete(id);

    disconnect(node, entry.node);
    fresh = false;
    markStale(node);

    entry.store.$reset();
    after(() => disposeNode(entry.node));
  }

  function set(action: unknown) {
    if (node.disposed) return;
    const next = typeof action === "function" ? action(node.read()) : action;

    if (next === null || typeof next !== "object") return;
    const given = next as Record<string, unknown>;

    write(node, () => {
      for (const id of Object.keys(given)) {
        (entryFor(id).store as any).$set(given[id]);
      }
    });
  }

  function clear() {
    write(node, () => {
      for (const id of Array.from(entries.keys())) remove(id);
    });
  }

  const api = defineStore(
    (key: string) => entryFor(key).store,
    node,
    set,
    clear
  );

  node.api = api;
  Object.defineProperties(api, {
    $clear: { value: clear },
    $delete: {
      value: (key: string) => {
        if (entries.has(key)) write(node, () => remove(key));
      },
    },
    $has: { value: (key: string) => entries.has(key) },
    $keys: {
      value: () => Array.from(entries.keys()),
    },
  });

  registerCollection(api, {
    entries: () =>
      Array.from(entries, ([id, entry]): [string, AnyStore] => [
        id,
        entry.store,
      ]),
    onEntry(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    onRemove(listener) {
      removers.add(listener);
      return () => removers.delete(listener);
    },
  });

  return Object.freeze(api) as unknown as CollectionStore<Entry>;
}
