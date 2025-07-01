/**
 * An interface for a storage object.
 */
export interface AsyncBrowserStorageAdapterOptions<State, StoredState = State>
  extends AsyncBrowserStorageTransforms<State, StoredState> {
  /**
   * Returns the current value associated with the given key, or null if the given key does not exist.
   *
   * @param key The key to retrieve the value for.
   * @returns The value associated with the key, or null if the key does not exist.
   */
  getItem(key: string): null | Promise<StoredState | undefined> | StoredState;

  /**
   * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
   *
   * @param key The key to remove the value for.
   */
  removeItem(key: string): Promise<void> | void;

  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   *
   * @param key The key to set the value for.
   * @param value The value to set.
   */
  setItem(key: string, value: StoredState): Promise<void> | void;
}

export interface AsyncBrowserStorageTransforms<State, StoredState = State> {
  /**
   * A function to transform the value before setting it in storage.
   * This can be used to serialize or modify the value.
   *
   * @param value The value to transform.
   * @returns The transformed value.
   */
  storageTransform?: (value: State) => StoredState;

  /**
   * A function to transform the value after getting it from storage.
   * This can be used to parse or modify the value.
   *
   * @param value The value to transform.
   * @returns The transformed value.
   */
  usageTransform?: (value: StoredState) => State;
}

export interface AsyncGetBrowserStorage<State> {
  /**
   * Get the state from storage or return a fallback state.
   *
   * @param fallback The fallback state to return if the state is not found in storage.
   * @returns The state from storage or the fallback state.
   */
  (fallback: State): Promise<State>;

  /**
   * Get the state from storage or return a fallback state.
   *
   * @param [fallback] The fallback state to return if the state is not found in storage.
   * @returns The state from storage, the fallback state, or undefined.
   */
  (fallback?: State): Promise<State | undefined>;
}

/**
 * Set the state in storage.
 *
 * @param value The state to set in storage.
 */
export type AsyncSetBrowserStorage<State> = (value?: State) => Promise<void>;
