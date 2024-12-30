export interface GetLocalStorage<State> {
  /**
   * Get the state from local storage.
   *
   * @returns The state from local storage or undefined.
   */
  (): State | undefined;

  /**
   * Get the state from local storage or return a fallback state.
   *
   * @param fallback The fallback state to return if the state is not found in local storage.
   * @returns The state from local storage or the fallback state.
   */
  (fallback: State): State;
}

/**
 * Set the state in local storage.
 *
 * @param value The state to set in local storage.
 */
export type SetLocalStorage<State> = (value?: State) => void;

export interface LocalStorageAdapter<State> {
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
