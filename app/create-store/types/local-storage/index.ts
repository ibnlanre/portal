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
