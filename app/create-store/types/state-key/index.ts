import type { AnyStore } from "@/create-store/types/any-store";
import type { GenericFunction } from "@/create-store/types/generic-function";

/** Keys of a shape that are state: branches and leaves, not methods. */
export type StateKey<Shape, Key extends keyof Shape> = [Shape[Key]] extends [
  AnyStore,
]
  ? Key
  : [Shape[Key]] extends [GenericFunction]
    ? never
    : Key;
