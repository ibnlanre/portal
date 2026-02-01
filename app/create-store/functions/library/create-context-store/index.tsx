import type { PropsWithChildren } from "react";

import type { ContextStore } from "@/create-store/types/context-store";
import type { ContextValue } from "@/create-store/types/context-value";

import { createContext, use } from "react";

/**
 * Initializes a context store with a provider and a hook for accessing its value.
 *
 * @param useHook A hook function that generates the store from the given context.
 * @returns A tuple with the StoreProvider component and the useStore hook.
 */
export function createContextStore<Context, Store>(
  useHook: ContextValue<Context, Store>
): ContextStore<Context, Store> {
  const StoreContext = createContext<null | Store>(null);
  StoreContext.displayName = "StoreContext";

  function StoreProvider({
    children,
    value,
  }: PropsWithChildren<{ value: Context }>) {
    const store = useHook(value);
    return <StoreContext value={store}>{children}</StoreContext>;
  }

  function useStore(): Store {
    const store = use(StoreContext);

    if (store === null) {
      throw new Error(
        `Make sure your component is wrapped in <${StoreContext.displayName}.Provider>`
      );
    }

    return store;
  }

  return [StoreProvider, useStore];
}
