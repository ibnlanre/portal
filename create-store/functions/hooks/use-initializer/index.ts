import { useMemo } from "react";

import { useVersion } from "@/create-store/functions/hooks/use-version";

/**
 * A custom hook that initializes a context store based on the provided context.
 *
 * @param initializer A function that initializes the store based on the context.
 * @param context The context to initialize the store with.
 * @returns The initialized context store.
 */
export function useInitializer<Context, ContextScope>(
  initializer: (context: Context) => ContextScope,
  context: Context
): ContextScope {
  const version = useVersion(context);
  return useMemo(() => initializer(context), version);
}
