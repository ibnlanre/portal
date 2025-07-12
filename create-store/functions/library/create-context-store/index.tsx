import type { PropsWithChildren } from "react";

import type { ContextEffect } from "@/create-store/types/context-effect";
import type { ContextFactory } from "@/create-store/types/context-initializer";
import type { ContextStore } from "@/create-store/types/context-store";

import { createContext, useContext } from "react";

import { useAsync } from "@/create-store/functions/hooks/use-async";
import { useSync } from "@/create-store/functions/hooks/use-sync";

/**
 * Creates a context provider and a hook to access the store.
 *
 * @param factory A function that initializes the store based on the context.
 * @param effect An optional effect function that runs when the store is created or updated.
 *
 * @returns An array containing the StoreProvider component and the useStore hook.
 */
export function createContextStore<Context, Store>(
  factory: ContextFactory<Context, Store>,
  effect: ContextEffect<Context, Store> = () => {}
): ContextStore<Context, Store> {
  const StoreContext = createContext<Store>(null as unknown as Store);
  StoreContext.displayName = "StoreContext";

  function StoreProvider({
    children,
    value,
  }: PropsWithChildren<{ value: Context }>) {
    const store = useSync(() => factory(value), [value]);
    useAsync(async () => effect(store, value), [store, value]);

    return (
      <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
  }

  function useStore() {
    const store = useContext(StoreContext);

    if (!store) {
      throw new Error("useStore must be used within a StoreProvider");
    }

    return store;
  }

  return [StoreProvider, useStore];
}
