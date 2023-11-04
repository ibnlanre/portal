import { useEffect, useRef, DependencyList, EffectCallback } from "react";

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
 * @param {number} delay - The delay in milliseconds to wait before invoking the effect.
 *
 * @returns {() => () => void} A function to trigger the debounced effect.
 */
const debounce = (effect: EffectCallback, delay: number) => {
  let destructor: ReturnType<EffectCallback>;
  let timeout: NodeJS.Timeout;

  const later = () => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      destructor = effect();
    }, delay);

    return () => {
      clearTimeout(timeout);
      destructor?.();
    };
  };

  return later;
};

export function useDebouncedShallowEffect(
  effect: EffectCallback,
  dependencies: DependencyList = [],
  delay: number = 650
): void {
  useEffect(debounce(effect, delay), useShallowCompare(dependencies));
}
