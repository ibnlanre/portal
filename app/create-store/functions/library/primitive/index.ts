import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { StoreNode } from "@/create-store/types/store-node";

import { write } from "@/create-store/functions/helpers/batch";
import { createDisposer } from "@/create-store/functions/helpers/create-disposer";
import { defineStore } from "@/create-store/functions/helpers/define-store";
import { markStale } from "@/create-store/functions/helpers/mark-stale";

/**
 * One whole value. The store never looks inside it: a write swaps the value,
 * and reads return the very reference you gave. To store a function, give the
 * initializer `() => fn` and write with an updater.
 */
export function primitive<Value>(
  initializer: () => Value
): PrimitiveStore<Value>;
export function primitive<Value>(initial: Value): PrimitiveStore<Value>;
export function primitive<Value>(initial: (() => Value) | Value) {
  const start = isInitializer<Value>(initial) ? initial() : initial;
  let value = start;

  const node: StoreNode = {
    api: {},
    children: () => [],
    disposeChildren() {},
    disposed: false,
    disposer: createDisposer(),
    holders: new Set(),
    kind: "primitive",
    listeners: new Set(),
    read: () => value,
    stale: () => true,
  };

  function assign(next: Value) {
    write(node, () => {
      value = next;
      markStale(node);
    });
  }

  function set(action: unknown) {
    if (node.disposed) return;
    assign(isUpdater<Value>(action) ? action(value) : (action as Value));
  }

  const api = defineStore({}, node, set, () => assign(start));
  node.api = api;
  return Object.freeze(api) as PrimitiveStore<Value>;
}

function isInitializer<Value>(value: unknown): value is () => Value {
  return typeof value === "function";
}

function isUpdater<Value>(value: unknown): value is (previous: Value) => Value {
  return typeof value === "function";
}
