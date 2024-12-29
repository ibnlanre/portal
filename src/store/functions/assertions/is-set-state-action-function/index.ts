/**
 * Type guard to check if a value is a SetStateAction function.
 *
 * @template Value The type of the state.
 * @param {unknown} value The value to be checked.
 * @returns {boolean} `true` if the value is a SetStateAction function, otherwise `false`.
 */
export function isSetStateActionFunction<Value>(
  value: unknown
): value is (prev: Value) => Value {
  return typeof value === "function";
}
