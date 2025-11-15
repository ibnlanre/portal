import type { GenericObject } from "@/create-store/types/generic-object";
import type { KeyStore } from "@/create-store/types/key-store";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";

export type CompositeStore<Value extends GenericObject> =
  CompositeHelper<Value>;

type CompositeHelper<Value extends GenericObject> =
  CompositeStoreValueResolver<Value> & KeyStore<Value>;

type CompositeStoreValueResolver<State extends GenericObject> = {
  readonly [Key in keyof State]: StoreValueResolver<State[Key]>;
};
