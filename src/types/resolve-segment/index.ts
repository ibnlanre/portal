import type { Dictionary } from "../dictionary";
import type { Segments } from "../segments";

export type ResolveSegment<
  Store extends Dictionary,
  Key extends Segments<Store, Delimiter>,
  Delimiter extends string = "."
> = Key extends [infer Head, ...infer Tail]
  ? Head extends keyof Store
    ? Tail extends []
      ? Store[Head]
      : Store[Head] extends Dictionary
      ? Tail extends Segments<Store[Head], Delimiter>
        ? ResolveSegment<Store[Head], Tail, Delimiter>
        : never
      : never
    : never
  : never;
