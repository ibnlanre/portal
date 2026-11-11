import type { StoreNode } from "@/create-store/types/store-node";

import { createNotificationQueue } from "@/create-store/functions/helpers/create-notification-queue";

const enqueue = createNotificationQueue();
let depth = 0;
let written: StoreNode[] = [];
let later: Array<() => void> = [];

/**
 * Runs `end` once the current outermost write has been delivered, so a store
 * written and ended in one write still tells its subscribers about the write.
 * Outside a write it runs at once.
 *
 * @param end What to do after delivery.
 */
export function after(end: () => void) {
  if (depth > 0) later.push(end);
  else end();
}

/**
 * Runs `changes` as one outermost write: writes made inside it are applied at
 * once, and every subscriber is called at most once, after it returns. Nested
 * calls join the outer one. If `changes` throws, the writes already applied
 * stay applied and delivery still happens once. If delivery throws as well,
 * both errors are thrown together in an `AggregateError`, the function's first.
 *
 * @param changes The writes to run together.
 */
export function batch(changes: () => void): void {
  if (depth > 0) {
    changes();
    return;
  }
  depth++;
  let failed = false;
  let failure: unknown;
  try {
    changes();
  } catch (error) {
    failed = true;
    failure = error;
  } finally {
    depth--;
  }
  const touched = written;
  const ending = later;

  written = [];
  later = [];

  try {
    if (touched.length > 0) commit(touched);
    if (ending.length > 0) enqueue(ending);
  } catch (delivery) {
    // Neither error is masked: the function's comes first, delivery's second.
    if (failed) {
      throw new AggregateError(
        [failure, delivery],
        "batch: the function and the delivery of its writes both failed."
      );
    }
    throw delivery;
  }
  if (failed) throw failure;
}

/**
 * Records a write to a store. Outside a batch it is its own outermost write and
 * notifies at once.
 *
 * @param node The store written.
 * @param apply Applies the write.
 */
export function write(node: StoreNode, apply: () => void) {
  if (node.disposed) return;
  if (depth > 0) {
    written.push(node);
    apply();
    return;
  }

  batch(() => {
    written.push(node);
    apply();
  });
}

/**
 * Notifies, once each, every store written, its descendants, and every store
 * connected to any of them, however far. Each store is visited once however
 * many paths lead to it.
 */
function commit(touched: StoreNode[]) {
  const heard = new Set<StoreNode>();

  const below = [...touched];
  while (below.length > 0) {
    const node = below.pop()!;
    if (heard.has(node)) continue;
    heard.add(node);
    for (const child of node.children()) below.push(child);
  }

  const above = [...touched];
  const reached = new Set<StoreNode>();
  while (above.length > 0) {
    for (const holder of above.pop()!.holders) {
      if (reached.has(holder)) continue;
      reached.add(holder);
      heard.add(holder);
      above.push(holder);
    }
  }

  const delivery: Array<() => void> = [];
  for (const node of heard) {
    if (node.listeners.size === 0) continue;
    const value = node.read();

    for (const listener of node.listeners) {
      delivery.push(() => {
        if (node.listeners.has(listener)) listener(value);
      });
    }
  }
  enqueue(delivery);
}
