import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Defined } from "@/create-store/types/defined";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { GenericFunction } from "@/create-store/types/generic-function";
import type { IsNever } from "@/create-store/types/is-never";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { WidenLiterals } from "@/create-store/types/widen-literals";

export type StoreValueResolver<Value> =
  IsNever<Defined<Value>> extends 1
    ? PrimitiveStore<undefined>
    : Defined<Value> extends Defined<Dictionary>
      ? CompositeStore<Defined<Value>>
      : Defined<Value> extends Defined<GenericFunction>
        ? Value
        : PrimitiveStore<WidenLiterals<Value>>;
