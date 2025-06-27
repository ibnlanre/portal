import type { CompositeStore } from "@/create-store/types/composite-store";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

export type InferType<Store> =
  Store extends CompositeStore<infer Composite>
    ? Composite
    : Store extends PrimitiveStore<infer Primitive>
      ? Primitive
      : never;
