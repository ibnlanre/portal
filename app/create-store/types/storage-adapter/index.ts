export interface StorageAdapter<State> {
  /**
   * The key to use in storage.
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

/**
 * An interface for a storage object.
 */
export interface StorageInterface {
  /**
   * Returns the current value associated with the given key, or null if the given key does not exist.
   *
   * @param key The key to retrieve the value for.
   * @returns The value associated with the key, or null if the key does not exist.
   */
  getItem(key: string): string | null;

  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   *
   * @param key The key to set the value for.
   * @param value The value to set.
   */
  setItem(key: string, value: string): void;

  /**
   * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
   *
   * @param key The key to remove the value for.
   */
  removeItem(key: string): void;
}

export interface BrowserStorageAdapter<State>
  extends StorageAdapter<State>,
    StorageInterface {}

export interface GetBrowserStorage<State> {
  /**
   * Get the state from storage.
   *
   * @returns The state from storage or undefined.
   */
  (): State | undefined;

  /**
   * Get the state from storage or return a fallback state.
   *
   * @param fallback The fallback state to return if the state is not found in storage.
   * @returns The state from storage or the fallback state.
   */
  (fallback: State): State;
}

/**
 * Set the state in storage.
 *
 * @param value The state to set in storage.
 */
export type SetBrowserStorage<State> = (value?: State) => void;
