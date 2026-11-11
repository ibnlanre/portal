import type { StoreNode } from "@/create-store/types/store-node";
import type { SubscribeOptions } from "@/create-store/types/subscribe-options";

import { disposeNode } from "@/create-store/functions/helpers/dispose-node";
import { registerNode } from "@/create-store/functions/helpers/nodes";
import { useStoreSnapshot } from "@/create-store/functions/hooks/use-store-snapshot";

/**
 * Defines the members every store has on `target` and registers its node.
 *
 * @template Target The public object of the store.
 * @param target The object that becomes the store.
 * @param node The node behind it.
 * @param set Writes to the store.
 * @param reset Returns the store to its initial value.
 * @returns The target.
 */
export function defineStore<Target extends object>(
  target: Target,
  node: StoreNode,
  set: (action: unknown) => void,
  reset: () => void
): Target {
  const getSnapshot = () => node.read();
  const subscribeToChanges = (listener: () => void) =>
    subscribe(node, listener, false);

  const members = {
    $dispose: () => disposeNode(node),
    $get: (select?: (state: any) => unknown) =>
      typeof select === "function" ? select(node.read()) : node.read(),
    $onDispose: node.disposer.add,
    $reset: reset,
    $set: set,
    $subscribe: (
      subscriber: (value: any) => void,
      options?: SubscribeOptions
    ) => subscribe(node, subscriber, options?.immediate),
    $use: function useStore(
      select?: (state: any) => unknown,
      dependencies?: any[]
    ) {
      const value = useStoreSnapshot(
        subscribeToChanges,
        getSnapshot,
        select,
        dependencies
      );
      return [value, set];
    },
  };

  for (const [name, value] of Object.entries(members)) {
    Object.defineProperty(target, name, { value });
  }
  registerNode(target, node);
  return target;
}

function subscribe(
  node: StoreNode,
  subscriber: (value: any) => void,
  immediate = true
) {
  if (node.disposed) {
    if (immediate) subscriber(node.read());
    return () => {};
  }
  node.listeners.add(subscriber);
  try {
    if (immediate) subscriber(node.read());
  } catch (error) {
    node.listeners.delete(subscriber);
    throw error;
  }
  return () => {
    node.listeners.delete(subscriber);
  };
}
