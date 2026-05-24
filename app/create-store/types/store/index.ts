import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { InferSchema } from "@/create-store/types/infer-schema";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";
import type { StandardSchema } from "@/create-store/types/schema";

export interface Store {
  createStore<Schema extends StandardSchema>(
    schema: Schema
  ): InferSchema<Schema> extends Dictionary
    ? CompositeStore<InferSchema<Schema>>
    : PrimitiveStore<InferSchema<Schema>>;
}
