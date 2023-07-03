import { Initial } from "../entries";
import { isFunction } from "./isFunction";

/**
 * Computes the initial state asynchronously based on the provided initial value.
 *
 * @template S The type of the state.
 * @param {Initial<S>} initialState The initial state value, a function to compute the state,
 * or a promise that resolves to the state, or a function that returns a promise that resolves to the state.
 * @returns {Promise<S | (() => S)>} A promise that resolves to the computed initial state.
 */
export async function getComputedState<S>(initialState: Initial<S>) {
  if (isFunction(initialState)) return initialState();
  if (initialState instanceof Promise) return await initialState;
  return initialState;
}
