import { useMemo } from "react";

import { useCompare } from "@/create-store/functions/hooks/use-compare";

/**
 * A custom hook that initializes a context store based on the provided context.
 *
 * @param initializer - A function that initializes the store based on the context.
 * @param context - The context to initialize the store with.
 * @returns The initialized context store.
 */
export function useInitializer<Context, ContextStore>(
  initializer: (context: Context) => ContextStore,
  context: Context
): ContextStore {
  const dependencies = useCompare(context);
  return useMemo(() => initializer(context), dependencies);
}
