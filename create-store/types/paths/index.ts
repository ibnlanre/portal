import type { Contains } from "@/create-store/types/contains";
import type { Dictionary } from "@/create-store/types/dictionary";

export type Paths<
  Store extends Dictionary,
  Delimiter extends string = ".",
> = PathsHelper<NonNullable<Store>, Delimiter>;

type PathsHelper<
  Store,
  Delimiter extends string,
  Visited extends readonly Dictionary[] = [],
> = Store extends Dictionary
  ? Contains<Store, Visited> extends 1
    ? never
    : Exclude<
        {
          [Key in keyof Store]: Key extends number | string
            ? Store[Key] extends infer Value
              ? NonNullable<Value> extends Dictionary
                ?
                    | `${Key}${Delimiter}${PathsHelper<
                        NonNullable<Value>,
                        Delimiter,
                        readonly [...Visited, Store]
                      >}`
                    | `${Key}`
                : `${Key}`
              : never
            : never;
        }[keyof Store],
        undefined
      >
  : never;
