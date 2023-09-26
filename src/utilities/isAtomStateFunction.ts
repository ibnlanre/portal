/**
 * Type guard that checks if a value is a function taking a context parameter and returning a State.
 *
 * @param {State | ((context: Context) => State)} value The value to check.
 * @returns {value is (context: Context) => State} True if the value is a valid set state function, false otherwise.
 */
export function isAtomStateFunction<State, Context>(
  value: State | ((context: Context) => State)
): value is (context: Context) => State {
  // Check if the value is a function by examining its type
  return typeof value === "function";
}
