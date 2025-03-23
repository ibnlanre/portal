import type { Dictionary } from "@/create-store/types/dictionary";
import type { NonCallableKeys } from "@/create-store/types/non-callable-keys";

export type OmitCallableProperties<Value> = Value extends Dictionary
  ? {
      [Key in keyof Value as NonCallableKeys<Value, Key>]: Value[Key];
    }
  : Value;
