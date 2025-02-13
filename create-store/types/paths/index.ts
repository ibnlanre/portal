import type { Dictionary } from "@/create-store/types/dictionary";

type PathsHelper<Store, Delimiter extends string> = Store extends Dictionary
  ? {
      [Key in keyof Store]: Key extends string | number
        ? Store[Key] extends Dictionary
          ? `${Key}` | `${Key}${Delimiter}${Paths<Store[Key], Delimiter>}`
          : `${Key}`
        : never;
    }[keyof Store]
  : never;

/**
 * Represents the union of all the possible paths in a store.
 */
export type Paths<
  Store extends Dictionary,
  Delimiter extends string = "."
> = Store extends Partial<infer Impartial>
  ? PathsHelper<Impartial, Delimiter>
  : PathsHelper<Store, Delimiter>;
