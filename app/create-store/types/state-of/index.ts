import type { AnyStore } from "@/create-store/types/any-store";
import type { StateKey } from "@/create-store/types/state-key";
import type { StoreState } from "@/create-store/types/store-state";

/** The state a composite reads as: each branch's state, each leaf's value. */
export type StateOf<Shape> = {
  [Key in keyof Shape as Key extends symbol ? never : StateKey<Shape, Key>]: [
    Shape[Key],
  ] extends [AnyStore]
    ? StoreState<Shape[Key]>
    : Shape[Key];
};
