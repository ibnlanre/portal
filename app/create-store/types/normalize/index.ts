import type { BuiltIn } from "@/create-store/types/built-in";

export type Normalize<Value> = Value extends BuiltIn
  ? Value
  : { [K in keyof Value]: Normalize<Value[K]> };
