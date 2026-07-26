/**
 * Represents the value of a key in a store.
 *
 * @template Key The type of the key.
 */
export type ParseAsNumber<Key extends number | string> =
  Key extends `${infer Value extends number}` ? Value : Key;
