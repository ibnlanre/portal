import { SetStateAction } from "react";

/**
 * Type guard to check if a value is a SetStateAction function.
 *
 * @template S The type of the state.
 * @param {SetStateAction<S>} value The value to be checked.
 * @returns {boolean} `true` if the value is a SetStateAction function, otherwise `false`.
 */
export function isSetStateFunction<S>(
  value: SetStateAction<S>
): value is (prev: S) => S {
  return typeof value === "function";
}
