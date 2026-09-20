import type { BranchValue } from "@/create-store/types/branch-value";
import type { BuiltIn } from "@/create-store/types/built-in";
import type { GenericObject } from "@/create-store/types/generic-object";

export type ResolveSegment<
  Store extends GenericObject,
  Key extends readonly (number | string)[],
  Delimiter extends string = ".",
> = ResolveSegments<Store, Key>;

type ResolveSegments<
  Store,
  Key extends readonly (number | string)[],
> = Key extends [infer Head, ...infer Tail extends (number | string)[]]
  ? Store extends null | undefined
    ? undefined
    : Store extends BuiltIn
      ? never
      : Tail extends []
        ? ValueAt<Store, Head>
        : ResolveSegments<ValueAt<Store, Head>, Tail>
  : never;

type ValueAt<Store, Head> = Head extends keyof Store
  ? BranchValue<Store, Head>
  : Head extends `${infer Numeric extends number}`
    ? Numeric extends keyof Store
      ? BranchValue<Store, Numeric>
      : never
    : never;
