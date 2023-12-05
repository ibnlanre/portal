import { useEffect, DependencyList, EffectCallback } from "react";

import { DebounceOptions } from "@/definition";
import { debounceEffect } from "@/utilities";

import { useShallowCompare } from "./useShallowCompare";

/**
 * A custom hook that debounces an effect function and compares its dependencies shallowly.
 *
 * @param {EffectCallback} effect The effect function to be debounced.
 * @param {DependencyList} dependencies The dependencies to compare shallowly.
 * @param {number} delay The debounce delay in milliseconds to wait before invoking the effect.
 *
 * @returns {void}
 */
export function useDebouncedShallowEffect(
  effect: EffectCallback,
  dependencies: DependencyList = [],
  options: DebounceOptions = {}
): void {
  const comparison = useShallowCompare(dependencies);
  useEffect(debounceEffect(effect, options), comparison);
}
