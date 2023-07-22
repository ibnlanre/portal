import { Action } from "definition";
import { Reducer } from "react";

/**
 * Type guard to check if a value is an action of type A (from the Action union type).
 *
 * @template S The type of the state.
 * @template A The type of the action.
 *
 * @param {Action<S, A>} value The value to be checked.
 * @param {Reducer<S, A>} [dispatch] The reducer function to handle actions.
 *
 * @returns {boolean} `true` if the value is an action of type A, otherwise `false`.
 */
export function isAction<S, A>(
  value: Action<S, A>,
  dispatch?: Reducer<S, A>
): value is A {
  return value && dispatch !== undefined;
}
