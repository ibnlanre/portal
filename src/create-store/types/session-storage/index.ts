export interface GetSessionStorage<State> {
  /**
   * Get the state from session storage.
   *
   * @returns The state from session storage or undefined.
   */
  (): State | undefined;

  /**
   * Get the state from session storage or return a fallback state.
   *
   * @param fallback The fallback state to return if the state is not found in session storage.
   * @returns The state from session storage or the fallback state.
   */
  (fallback: State): State;
}

/**
 * Set the state in session storage.
 *
 * @param value The state to set in session storage.
 */
export type SetSessionStorage<State> = (value?: State) => void;

export interface SessionStorageAdapter<State> {
  /**
   * The key to use in session storage.
   */
  key: string;

  /**
   * A function to serialize the state to a string.
   *
   * @param value The state to serialize.
   * @default JSON.stringify
   *
   * @returns The serialized state.
   */
  stringify?: (value: State) => string;

  /**
   * A function to parse the state from a string.
   *
   * @param value The string to parse.
   * @default JSON.parse
   *
   * @returns The parsed state.
   */
  parse?: (value: string) => State;
}
