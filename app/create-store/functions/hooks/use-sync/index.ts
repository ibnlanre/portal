import type { DependencyList } from "react";

import type { SyncFunction } from "@/create-store/types/sync-function";

import { useMemo } from "react";

import { useVersion } from "@/create-store/functions/hooks/use-version";

/**
 * A custom hook that computes data synchronously based on a factory function and optional dependencies.
 *
 * @param factory A function that produces the synchronous data.
 * @param dependencies An optional list of dependencies that, when changed, will trigger a re-computation of the data.
 *
 * @returns The computed data from the factory function.
 */
export function useSync<Data>(
  factory: SyncFunction<Data>,
  dependencies: DependencyList = []
): Data {
  const version = useVersion(dependencies);
  return useMemo(factory, [version]);
}
