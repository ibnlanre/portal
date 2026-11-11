import type { AnyStore } from "@/create-store/types/any-store";
import type { StateKey } from "@/create-store/types/state-key";
import type { StoreInput } from "@/create-store/types/store-input";

/** What a write to a composite accepts: per listed branch, by its own rule. */
export type SetOf<Shape> = {
  [Key in keyof Shape as Key extends symbol ? never : StateKey<Shape, Key>]?: [
    Shape[Key],
  ] extends [AnyStore]
    ? StoreInput<Shape[Key]>
    : Shape[Key];
};
