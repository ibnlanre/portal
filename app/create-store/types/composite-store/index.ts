import type { AnyStore } from "@/create-store/types/any-store";
import type { GenericFunction } from "@/create-store/types/generic-function";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { ReservedKey } from "@/create-store/types/reserved-key";
import type { SetOf } from "@/create-store/types/set-of";
import type { StateOf } from "@/create-store/types/state-of";
import type { Store } from "@/create-store/types/store";

/** A tree of stores: the named branches you declared, each a store. */
export type CompositeStore<Shape extends GenericObject> = Members<Shape> &
  Store<StateOf<Shape>, SetOf<Shape>>;

/** The members of a composite: its branches, leaves and methods, as written. */
type Members<Shape> = {
  readonly [
    Key in keyof Shape as Key extends ReservedKey | symbol ? never : Key
  ]: [Shape[Key]] extends [AnyStore]
    ? Shape[Key]
    : [Shape[Key]] extends [GenericFunction]
      ? Shape[Key]
      : PrimitiveStore<Shape[Key]>;
};
