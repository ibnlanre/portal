import type { Dictionary } from "@/create-store/types/dictionary";
import type { KeyStore } from "@/create-store/types/key-store";
import type { StoreHandles } from "@/create-store/types/store-handles";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";

export type CompositeStore<
  Value extends Dictionary,
  Handles extends StoreHandles = ["$act", "$get", "$key", "$set", "$use"]
> = KeyStore<Value, Handles> & {
  readonly [Key in keyof Value]: StoreValueResolver<Value[Key]>;
};
