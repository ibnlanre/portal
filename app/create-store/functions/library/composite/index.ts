import type { CompositeStore } from "@/create-store/types/composite-store";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { NoReservedKeys } from "@/create-store/types/no-reserved-keys";
import type { StoreNode } from "@/create-store/types/store-node";

import { isStore } from "@/create-store/functions/assertions/is-store";
import { write } from "@/create-store/functions/helpers/batch";
import { connect, disconnect } from "@/create-store/functions/helpers/connect";
import { createDisposer } from "@/create-store/functions/helpers/create-disposer";
import { defineStore } from "@/create-store/functions/helpers/define-store";
import { disposeNode } from "@/create-store/functions/helpers/dispose-node";
import { nodeOf } from "@/create-store/functions/helpers/nodes";
import { isRef } from "@/create-store/functions/helpers/refs";
import { primitive } from "@/create-store/functions/library/primitive";

const reserved = new Set([
  "$dispose",
  "$get",
  "$onDispose",
  "$reset",
  "$set",
  "$subscribe",
  "$use",
]);

/**
 * A composite connects to each store in its shape. A member is decided by what
 * you wrote: a store is that branch (the same object, never a copy), a function
 * stays a method, and anything else becomes a leaf, a `primitive(value)` made
 * for you. A plain object is a leaf; write `composite({ ... })` to branch it.
 *
 * The same store may be a branch of any number of composites, so a write to it
 * shows in all of them. `$set(partial)` writes each listed branch by that
 * branch's own rule (a composite branch recurses, a primitive branch swaps) and
 * leaves the others alone; `$reset` resets every branch. Both pass through to
 * shared branches. Disposing a composite disposes only the
 * leaves it made and disconnects from the rest, which stay alive. A `ref` is a
 * member too, but it is outside the state: never read, written or reset by the
 * composite.
 *
 * Throws if a key is reserved (`$get`, `$use`, `$set`, `$subscribe`, `$reset`,
 * `$dispose`, `$onDispose`). Symbol keys are ignored.
 */
export function composite<Shape extends GenericObject>(
  shape: NoReservedKeys<Shape>
): CompositeStore<Shape> {
  const branches = new Map<string, StoreNode>();
  const stores = new Map<string, any>();
  const methods = new Map<string, unknown>();
  const refs = new Map<string, unknown>();
  const owned = new Set<StoreNode>();
  let cache: Record<string, unknown> | undefined;
  let fresh = false;
  let frozen = false;

  for (const key of Object.keys(shape)) {
    if (reserved.has(key)) {
      throw new Error(`composite: "${key}" is reserved for the store itself.`);
    }
  }

  const node: StoreNode = {
    api: {},
    children: () => branches.values(),
    disposeChildren() {
      // Keep the last value readable once the connections are gone.
      node.read();
      frozen = true;
      for (const child of branches.values()) {
        disconnect(node, child);
        if (owned.has(child)) disposeNode(child);
      }
    },
    disposed: false,
    disposer: createDisposer(),
    holders: new Set(),
    kind: "composite",
    listeners: new Set(),
    read() {
      if ((fresh || frozen) && cache) return cache;
      const next: Record<string, unknown> = {};
      let same = cache !== undefined;
      for (const [key, branch] of branches) {
        const value = branch.read();
        next[key] = value;
        if (same && !Object.is(cache![key], value)) same = false;
      }
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

  for (const key of Object.keys(shape)) {
    const member: unknown = shape[key];
    if (isRef(member)) {
      refs.set(key, member);
      continue;
    }
    if (typeof member === "function" && !isStore(member)) {
      methods.set(key, member);
      continue;
    }
    const store = isStore(member) ? member : primitive(member);
    const child = nodeOf(store)!;
    if (store !== member) owned.add(child);
    connect(node, child);
    branches.set(key, child);
    stores.set(key, store);
  }

  function set(action: unknown) {
    if (node.disposed) return;
    const next = typeof action === "function" ? action(node.read()) : action;
    if (next === null || typeof next !== "object") return;
    const given = next as Record<string, unknown>;
    write(node, () => {
      for (const [key, store] of stores) {
        if (!Object.hasOwn(given, key)) continue;
        const value = given[key];
        if (value === undefined && nodeOf(store)!.kind !== "primitive")
          continue;
        store.$set(value);
      }
    });
  }

  function reset() {
    write(node, () => {
      for (const store of stores.values()) store.$reset();
    });
  }

  const api = defineStore({} as Record<string, unknown>, node, set, reset);
  node.api = api;
  for (const [key, store] of stores) {
    Object.defineProperty(api, key, { enumerable: true, value: store });
  }
  for (const [key, held] of refs) {
    Object.defineProperty(api, key, { enumerable: true, value: held });
  }
  for (const [key, method] of methods) {
    Object.defineProperty(api, key, { enumerable: true, value: method });
  }
  return Object.freeze(api) as CompositeStore<Shape>;
}
