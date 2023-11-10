import { SetStateAction } from "react";
import { isSetStateFunction } from "./isSetStateFunction";

/**
 * Gets the actual state value from the provided initial state.
 * @template S The type of the initial state value.
 * @param {S | ((prevState: S) => S)} initialState The initial state value or a function that returns the initial state.
 * @returns {S} The actual state value.
 */
export function getComputedState<S>(
  initialState: SetStateAction<S>,
  previousState: S
) {
  if (isSetStateFunction(initialState)) return initialState(previousState);
  return initialState;
}
