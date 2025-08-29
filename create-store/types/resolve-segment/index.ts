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
      : Store[Head] extends GenericObject
        ? Tail extends Segments<Store[Head], Delimiter>
          ? ResolveSegment<Store[Head], Tail, Delimiter>
          : never
        : never
    : never
  : never;
