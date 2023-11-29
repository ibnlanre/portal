import { shallowCompare } from "@/utilities";
import { DependencyList, useRef } from "react";

/**
 * A custom hook that returns an array with a single number that increments
 * whenever the dependencies passed to it have changed shallowly.
 *
 * @param {DependencyList} dependencies The dependencies to compare shallowly.
 *
 * @returns {[number]} An array with a single number that increments whenever
 * the dependencies have changed shallowly.
 */
export function useShallowCompare(dependencies?: DependencyList): [number] {
  const ref = useRef<DependencyList | undefined>([]);
  const updateRef = useRef(0);

  if (!shallowCompare(ref.current, dependencies)) {
    ref.current = dependencies;
    updateRef.current++;
  }

  return [updateRef.current];
}
