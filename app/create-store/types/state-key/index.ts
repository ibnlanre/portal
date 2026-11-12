import type { AnyStore } from "@/create-store/types/any-store";
import type { GenericFunction } from "@/create-store/types/generic-function";
import type { RefStore } from "@/create-store/types/ref-store";

/** Keys of a shape that are state: branches and leaves, not methods or refs. */
export type StateKey<Shape, Key extends keyof Shape> = [Shape[Key]] extends [
  AnyStore,
]
  ? Key
  : [Shape[Key]] extends [GenericFunction]
    ? never
    : [Shape[Key]] extends [RefStore<any>]
      ? never
      : Key;
