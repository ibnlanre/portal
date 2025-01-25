import type { Dictionary } from "@/create-store/types/dictionary";
import type { KeyStore } from "@/create-store/types/key-store";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

export type CompositeStore<Value extends Dictionary> = KeyStore<Value> & {
  [Key in keyof Value]: Value[Key] extends Dictionary
    ? CompositeStore<Value[Key]>
    : PrimitiveStore<Value[Key]>;
};
