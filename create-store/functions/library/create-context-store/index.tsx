import type { ContextInitializer } from "@/create-store/types/context-initializer";
import type { ContextStore } from "@/create-store/types/context-store";

import { createContext, type PropsWithChildren, useContext } from "react";

import { useInitializer } from "@/create-store/functions/hooks/use-initializer";

/**
 * Creates a context provider and a hook to access the store.
 *
 * @param initializer - A function that initializes the store based on the context.
 * @returns An array containing the StoreProvider component and the useStore hook.
 */
export function createContextStore<Context, Store>(
  initializer: ContextInitializer<Context, Store>
): ContextStore<Context, Store> {
  const StoreContext = createContext<Store>(null as unknown as Store);

  function StoreProvider({
    children,
    value,
  }: PropsWithChildren<{ value: Context }>) {
    const store = useInitializer(initializer, value);
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

  StoreContext.displayName = "StoreContext";
  return [StoreProvider, useStore] as const;
}
