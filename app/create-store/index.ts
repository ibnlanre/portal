import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { CompositeStore } from "@/create-store/types/composite-store";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { InferSchema } from "@/create-store/types/infer-schema";
import type { OnlyFunctions } from "@/create-store/types/only-functions";
import type { PrimitiveStore } from "@/create-store/types/primitive-store";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isSchema } from "@/create-store/functions/assertions/is-schema";
import { createCompositeStore } from "@/create-store/functions/library/create-composite-store";
import { createPrimitiveStore } from "@/create-store/functions/library/create-primitive-store";

/**
 * Creates a composite store from a schema whose output is a plain object.
 * Every property in the schema becomes a nested store node, accessible via
 * dot notation and the `$at` path accessor.
 *
 * @example
 * ```ts
 * const count = createStore(
 *   z.object({
 *     value: z.number(),
 *     label: z.string(),
 *   }),
 *   { value: 0, label: "count" }
 * );
 *
 * count.value.$get(); // 0
 * count.value.$set((n) => n + 1);
 */
export function createStore<
  Schema extends StandardSchemaV1<Dictionary>,
  Initial extends Dictionary & InferSchema<Schema>,
>(
  schema: Schema,
  initialState: Initial
): CompositeStore<InferSchema<Schema> & OnlyFunctions<Initial>>;
/**
 * Creates a primitive store from a schema whose output is not a plain object.
 * The store holds a single value accessible and updatable via `$get`, `$set`,
 * `$use`, and `$subscribe`.
 *
 * @example
 * ```ts
 * const count = createStore(z.number(), 0);
 * count.$get(); // 0
 * count.$set((n) => n + 1);
 * ```
 *
 * @example
 * ```ts
 * const label = createStore(z.string(), "count");
 * label.$get(); // "count"
 * label.$set("total");
 * ```
 */
export function createStore<
  Schema extends StandardSchemaV1,
  State extends InferSchema<Schema>,
>(schema: Schema, initialState: NoInfer<State>): PrimitiveStore<State>;
/**
 * Creates a store from a schema, inferring the appropriate store type based on
 * whether the schema output is a plain object or not.
 */
export function createStore<
  Schema extends StandardSchemaV1,
  State extends InferSchema<Schema>,
>(schema: Schema, initialState: NoInfer<State>) {
  if (!isSchema(schema)) {
    throw new Error(
      "createStore: schema must implement the Standard Schema V1 protocol"
    );
  }

  if (isDictionary(initialState))
    return createCompositeStore(
      schema as StandardSchemaV1<typeof initialState>,
      initialState
    );
  return createPrimitiveStore(schema, initialState);
}
