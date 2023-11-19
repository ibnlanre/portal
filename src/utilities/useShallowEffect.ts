import { useEffect, useRef, DependencyList, EffectCallback } from "react";

/**
 * A function that compares two values shallowly.
 *
 * @param {any} a - The first value to compare.
 * @param {any} b - The second value to compare.
 *
 * @returns {boolean} Whether the two values are equal shallowly.
 */
function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * A function that compares two dependency lists shallowly.
 *
 * @param {DependencyList | null | undefined} prevValue - The previous dependency list.
 * @param {DependencyList} currValue - The current dependency list.
 *
 * @returns {boolean} Whether the two dependency lists are equal shallowly.
 */
function shallowCompare(
  prevValue?: DependencyList | null,
  currValue?: DependencyList
): boolean {
  if (!prevValue || !currValue) return false;
  if (prevValue === currValue) return true;
  if (prevValue.length !== currValue.length) return false;

  for (let i = 0; i < prevValue.length; i++) {
    if (!shallowEqual(prevValue[i], currValue[i])) return false;
  }

  return true;
}

/**
 * A custom hook that returns an array with a single number that increments
 * whenever the dependencies passed to it have changed shallowly.
 *
 * @param {DependencyList} dependencies - The dependencies to compare shallowly.
 *
 * @returns {[number]} An array with a single number that increments whenever
 * the dependencies have changed shallowly.
 */
function useShallowCompare(dependencies?: DependencyList): [number] {
  const ref = useRef<DependencyList | undefined>([]);
  const updateRef = useRef(0);

  if (!shallowCompare(ref.current, dependencies)) {
    ref.current = dependencies;
    updateRef.current++;
  }

  return [updateRef.current];
}

/**
 * Debounce an effect function.
 *
 * @param {EffectCallback} effect - The effect function to be debounced.
 * @param {number} delay - The debounce delay in milliseconds before invoking the effect.
 *
 * @returns {() => () => void} A function to trigger the debounced effect.
 */
const debounce = (effect: EffectCallback, delay: number): (() => void) => {
  let destructor: ReturnType<EffectCallback>;
  let timeout: NodeJS.Timeout;

  const later = (): (() => void) => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      destructor = effect();
    }, delay);

    return (): void => {
      clearTimeout(timeout);
      destructor?.();
    };
  };

  return later;
};

/**
 * A custom hook that debounces an effect function and compares its dependencies shallowly.
 *
 * @param {EffectCallback} effect - The effect function to be debounced.
 * @param {DependencyList} dependencies - The dependencies to compare shallowly.
 * @param {number} delay - The debounce delay in milliseconds to wait before invoking the effect.
 *
 * @returns {void}
 */
export function useDebouncedShallowEffect(
  effect: EffectCallback,
  dependencies: DependencyList = [],
  delay: number
): void {
  useEffect(debounce(effect, delay), useShallowCompare(dependencies));
}
