import type { Contains } from "@/create-store/types/contains";
import type { GenericObject } from "@/create-store/types/generic-object";

export type Paths<
  Store extends GenericObject,
  Delimiter extends string = ".",
> = PathsHelper<NonNullable<Store>, Delimiter>;

type JoinPaths<
  Prefix extends string,
  Paths extends string,
  Delimiter extends string,
> = Paths extends string ? `${Prefix}${Delimiter}${Paths}` : never;

type PathsHelper<
  Store,
  Delimiter extends string,
  Visited extends readonly GenericObject[] = [],
> = Store extends GenericObject
  ? Contains<Store, Visited> extends 1
    ? never
    : Store extends readonly unknown[]
      ? never
      : Exclude<
          {
            [Key in keyof Store]: Key extends number | string
              ? Store[Key] extends infer Value
                ? NonNullable<Value> extends GenericObject
                  ? NonNullable<Value> extends readonly unknown[]
                    ? `${Key}`
                    :
                        | `${Key}`
                        | JoinPaths<
                            `${Key}`,
                            PathsHelper<
                              NonNullable<Value>,
                              Delimiter,
                              readonly [...Visited, Store]
                            >,
                            Delimiter
                          >
                  : `${Key}`
                : never
              : never;
          }[keyof Store],
          undefined
        >
  : never;
