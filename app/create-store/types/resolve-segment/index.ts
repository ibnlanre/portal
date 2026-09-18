import type { GenericObject } from "@/create-store/types/generic-object";
import type { Segments } from "@/create-store/types/segments";

export type ResolveSegment<
  Store extends GenericObject,
  Key extends Segments<Store, Delimiter>,
  Delimiter extends string = ".",
> = Key extends [infer Head, ...infer Tail]
  ? Head extends keyof Store
    ? Tail extends []
      ? Store[Head]
      : NonNullable<Store[Head]> extends GenericObject
        ? Tail extends Segments<NonNullable<Store[Head]>, Delimiter>
          ? | ResolveSegment<NonNullable<Store[Head]>, Tail, Delimiter>
            | (Extract<Store[Head], null | undefined> extends never
                ? never
                : undefined)
          : never
        : never
    : never
  : never;
