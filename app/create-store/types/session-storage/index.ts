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
