import type { PropsWithChildren } from "react";

import type { ContextScope } from "@/create-store/types/context-scope";
import type { ContextValue } from "@/create-store/types/context-value";

import { createContext, useContext } from "react";

/**
 * Creates a context provider and a hook to access the store.
 *
 * @param use An hook that initializes the store based on the context.
 * @returns An array containing the ScopeProvider component and the useScope hook.
 */
export function createContextScope<Context, Scope>(
  use: ContextValue<Context, Scope>
): ContextScope<Context, Scope> {
  const ScopeContext = createContext<null | Scope>(null);
  ScopeContext.displayName = "ScopeContext";

  function ScopeProvider({
    children,
    value,
  }: PropsWithChildren<{ value: Context }>) {
    const scope = use(value);
    return (
      <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>
    );
  }

  function useScope() {
    const store = useContext(ScopeContext);

    if (!store) {
      throw new Error("The scope hook must be used within its provider.");
    }

    return store;
  }

  return [ScopeProvider, useScope];
}
