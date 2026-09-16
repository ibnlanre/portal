import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { InferSchema } from "@/create-store/types/infer-schema";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";

/**
 * A reusable store definition derived from a Standard Schema.
 *
 * The definition is callable — invoking it creates a fresh store instance
 * whose state conforms to the schema:
 *
 * - Called with no argument it seeds the store from the schema's `.default()`s.
 * - Called with a value it parses that value through the schema before creating
 *   the store, throwing when the value does not conform.
 *
 * Because it is a plain function taking the initial value, a definition is also
 * a valid `createContextStore` factory and can be passed to it directly.
 */
export type StoreDefinition<Schema extends StandardSchemaV1> = {
  (): StoreValueResolver<InferSchema<Schema>>;
  (
    state: StandardSchemaV1.InferInput<Schema>
  ): StoreValueResolver<InferSchema<Schema>>;
  readonly schema: Schema;
};
