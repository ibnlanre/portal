import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Defined } from "@/create-store/types/defined";
import type { GenericFunction } from "@/create-store/types/generic-function";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { IsNever } from "@/create-store/types/is-never";
import type { IsNullable } from "@/create-store/types/is-nullable";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

export type StoreValueResolver<Value> =
  IsNever<Defined<Value>> extends 1
    ? PrimitiveStore<undefined>
    : IsNullable<Value> extends true
      ? PrimitiveStore<Value>
      : Defined<Value> extends GenericFunction
        ? Value
        : Defined<Value> extends GenericObject
          ? CompositeStore<Defined<Value>>
          : PrimitiveStore<Value>;
