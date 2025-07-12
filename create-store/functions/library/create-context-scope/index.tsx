import type { PropsWithChildren } from "react";

import type { ContextEffect } from "@/create-store/types/context-effect";
import type { ContextFactory } from "@/create-store/types/context-initializer";
import type { ContextScope } from "@/create-store/types/context-scope";

import { createContext, useContext } from "react";

import { useAsync } from "@/create-store/functions/hooks/use-async";
import { useSync } from "@/create-store/functions/hooks/use-sync";

/**
 * Creates a context provider and a hook to access the store.
 *
 * @param factory A function that initializes the store based on the context.
 * @param effect An optional effect function that runs when the store is created or updated.
 *
 * @returns An array containing the ScopeProvider component and the useScope hook.
 */
export function createContextScope<Context, Scope>(
  factory: ContextFactory<Context, Scope>,
  effect: ContextEffect<Scope> = () => {}
): ContextScope<Context, Scope> {
  const ScopeContext = createContext<Scope>(null as unknown as Scope);
  ScopeContext.displayName = "ScopeContext";

  function ScopeProvider({
    children,
    value,
  }: PropsWithChildren<{ value: Context }>) {
    const scope = useSync(factory, value);

    useAsync(async ({ signal }) => {
      await effect(scope, signal);
    }, value);

    return (
      <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>
    );
  }

  function useScope() {
    const store = useContext(ScopeContext);

    if (!store) {
      throw new Error("useScope must be used within a ScopeProvider");
    }

    return store;
  }

  return [ScopeProvider, useScope];
}
