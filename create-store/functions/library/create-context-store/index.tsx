import type { PropsWithChildren } from "react";

import type { ContextStore } from "@/create-store/types/context-store";
import type { ContextValue } from "@/create-store/types/context-value";

import { createContext, useContext } from "react";

/**
 * Initializes a context store with a provider and a hook for accessing its value.
 *
 * @param use A hook function that generates the store from the given context.
 * @param displayName An optional display name for the context, used for debugging.
 *                    Defaults to "StoreContext" if not provided.
 *
 * @returns A tuple with the StoreProvider component and the useStore hook.
 */
export function createContextStore<Context, Store>(
  use: ContextValue<Context, Store>,
  displayName: string = "StoreContext"
): ContextStore<Context, Store> {
  const StoreContext = createContext<null | Store>(null);
  StoreContext.displayName = displayName;

  function StoreProvider({
    children,
    value,
  }: PropsWithChildren<{ value: Context }>) {
    const store = use(value);
    return (
      <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
  }

  function useStore(): Store {
    const store = useContext(StoreContext);

    if (store === null) {
      throw new Error(
        `Make sure your component is wrapped in <${displayName}.Provider>`
      );
    }

    return store;
  }

  return [StoreProvider, useStore];
}
