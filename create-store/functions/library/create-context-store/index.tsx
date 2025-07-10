import { createContext, type PropsWithChildren, useContext } from "react";

import { useInitializer } from "@/create-store/functions/hooks/use-initializer";

interface ContextInitializer<Context, ContextStore> {
  (context: Context): ContextStore;
}

/**
 * Creates a context provider and a hook to access the store.
 *
 * @param initializer - A function that initializes the store based on the context.
 * @returns An array containing the StoreProvider component and the useStore hook.
 */
export function createContextStore<Context, ContextStore>(
  initializer: ContextInitializer<Context, ContextStore>
) {
  const StoreContext = createContext<ContextStore>(
    null as unknown as ContextStore
  );

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
