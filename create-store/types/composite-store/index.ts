import type { Dictionary } from "@/create-store/types/dictionary";
import type { KeyStore } from "@/create-store/types/key-store";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";

export type CompositeStore<Value extends Dictionary> = KeyStore<Value> & {
  readonly [Key in keyof Value]: StoreValueResolver<Value[Key]>;
};
