import type { Subscriber } from "@/create-store/types/subscriber";

/**
 * Tracks subscribers by path and reclaims the entry when the last subscriber
 * for a path leaves, so historical paths never keep charging later delivery.
 */
export function createSubscriptionRegistry<Key>() {
  const registry = new Map<Key, Set<Subscriber<unknown>>>();

  /** Registers a subscriber and returns the live set for its path. */
  function add(key: Key, subscriber: Subscriber<unknown>) {
    let set = registry.get(key);
    if (!set) registry.set(key, (set = new Set()));
    set.add(subscriber);
    return set;
  }

  /** Returns `true` while at least one subscriber is registered for the path. */
  function has(key: Key) {
    return registry.has(key);
  }

  /** Number of paths that currently hold at least one subscriber. */
  function size() {
    return registry.size;
  }

  /** Removes a subscriber and reclaims the path when nothing remains. */
  function remove(key: Key, subscriber: Subscriber<unknown>) {
    const set = registry.get(key);
    if (!set) return;
    set.delete(subscriber);
    if (!set.size) registry.delete(key);
  }

  /** Visits every path that currently holds at least one subscriber. */
  function forEach(
    callback: (set: Set<Subscriber<unknown>>, key: Key) => void
  ) {
    registry.forEach(callback);
  }

  return { add, forEach, has, remove, size };
}
