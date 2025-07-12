import type { SyncFunction } from "@/create-store/types/sync-function";

import { useMemo } from "react";

import { useVersion } from "@/create-store/functions/hooks/use-version";

export function useSync<Data, Params>(
  factory: SyncFunction<Data, Params>,
  params: Params = undefined as Params
): Data {
  const version = useVersion(params);
  return useMemo(() => factory(params), version);
}
