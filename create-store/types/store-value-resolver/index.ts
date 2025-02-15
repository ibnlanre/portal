import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

export type StoreValueResolver<Value> = Value extends Function
  ? Value
  : Value extends Dictionary
  ? CompositeStore<Value>
  : PrimitiveStore<Value>;
