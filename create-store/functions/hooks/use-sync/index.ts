import type { DependencyList, EffectCallback } from "react";

import { useEffect } from "react";

import { useVersion } from "@/create-store/functions/hooks/use-version";

export function useSync(
  effect: EffectCallback,
  dependencies: DependencyList = []
): void {
  const version = useVersion(dependencies);
  useEffect(effect, version);
}
