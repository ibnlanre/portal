import type { PersistedFormatOptions } from "@/create-store/types/persisted-format-options";

export interface StorageAdapterOptions<
  State,
> extends PersistedFormatOptions<State> {
  /**
   * A function to parse the state from a string. By default it is `JSON.parse`,
   * and unparsable text is logged and counts as absent. A string written by the
   * default `stringify` is JSON-quoted, so give `parse` and `stringify` as a
   * pair to store raw text.
   *
   * @param value The string to parse.
   * @default JSON.parse
   *
   * @returns The parsed state. `null` or `undefined` means no value was
   * found, so the adapter's fallback applies.
   */
  parse?: (value: string) => null | State | undefined;

  /**
   * A function to serialize the state to a string. By default it is
   * `JSON.stringify`, so a string is written JSON-quoted (`"dark"`).
   *
   * @param value The state to serialize.
   * @default JSON.stringify
   *
   * @returns The serialized state.
   */
  stringify?: (value: State) => string;
}
