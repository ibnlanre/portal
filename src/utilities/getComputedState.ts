import { isFunction } from "./isFunction";

/**
 * Gets the actual state value from the provided initial state.
 * @template S The type of the initial state value.
 * @param {S | (() => S)} initialState The initial state value or a function that returns the initial state.
 * @returns {S} The actual state value.
 */
export function getComputedState<S>(initialState: S | (() => S)) {
  if (isFunction(initialState)) return initialState();
  return initialState;
}
