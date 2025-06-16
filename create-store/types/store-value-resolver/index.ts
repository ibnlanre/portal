import type { BasicStore } from "@/create-store/types/basic-store";
import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { WidenLiterals } from "@/create-store/types/widen-literals";

export type StoreValueResolver<Value> = Value extends Function
  ? Value
  : NonNullable<Value> extends Dictionary
  ? CompositeStore<NonNullable<Value>>
  : BasicStore<WidenLiterals<Value>>;
