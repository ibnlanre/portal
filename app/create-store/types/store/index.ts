import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { InferSchema } from "@/create-store/types/infer-schema";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

export interface Store {
  <Schema extends StandardSchemaV1>(
    schema: Schema
  ): InferSchema<Schema> extends Dictionary
    ? CompositeStore<InferSchema<Schema>>
    : PrimitiveStore<InferSchema<Schema>>;
}
