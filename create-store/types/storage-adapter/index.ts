export interface StorageAdapterOptions<State> {
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
