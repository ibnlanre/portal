import type { SyncFunction } from "@/create-store/types/sync-function";

import { type DependencyList, useMemo } from "react";

import { useVersion } from "@/create-store/functions/hooks/use-version";

export function useSync<Data>(
  factory: SyncFunction<Data>,
  dependencies: DependencyList = []
): Data {
  const version = useVersion(dependencies);
  return useMemo(factory, version);
}
