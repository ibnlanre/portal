import type { BasicStore } from "@/create-store/types/basic-store";
import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";

export type StoreValueResolver<Value> = Value extends Function
  ? Value
  : Value extends Dictionary
  ? CompositeStore<Value>
  : BasicStore<Value>;
