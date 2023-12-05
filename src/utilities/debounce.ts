import { EffectCallback } from "react";
import { DebounceOptions } from "@/definition";

/**
 * Debounce an effect function.
 *
 * @param {EffectCallback} effect The effect function to be debounced.
 * @param {Object} [options={}] The options object.
 * @param {number} [options.delay] The delay in milliseconds before invoking the effect.
 * @param {boolean} [options.leading=false] The effect function should be invoked on the leading edge.
 * @param {boolean} [options.trailing=true] The effect function should be invoked on the trailing edge.
 *
 * @returns {() => () => void} A function to trigger the debounced effect.
 */
export function debounceEffect(
  effect: EffectCallback,
  options: DebounceOptions = {}
) {
  const { delay = 0, leading = false, trailing = true } = options;

  if (!delay) return effect;

  let timeout: NodeJS.Timeout | null = null;
  let destructor: ReturnType<EffectCallback> | null = null;

  const debouncedEffect = () => {
    if (timeout) clearTimeout(timeout);
    if (leading && !timeout) destructor = effect();

    timeout = setTimeout(() => {
      if (trailing) destructor = effect();
      timeout = null;
    }, delay);

    return (): void => {
      if (timeout) clearTimeout(timeout);
      destructor?.();
    };
  };

  return debouncedEffect;
}
