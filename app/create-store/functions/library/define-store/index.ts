import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { InferSchema } from "@/create-store/types/infer-schema";
import type { StoreDefinition } from "@/create-store/types/store-definition";
import type { StoreValueResolver } from "@/create-store/types/store-value-resolver";

import { createStore } from "@/create-store";
import { isSchema } from "@/create-store/functions/assertions/is-schema";
import { resolveSchema } from "@/create-store/functions/utilities/resolve-schema";

/**
 * Creates a reusable, schema-backed store definition.
 *
 * The returned definition is a function that builds a fresh store instance per
 * call (see {@link StoreDefinition}) and carries the schema on `.schema`.
 *
 * @param schema The schema that defines the store's state.
 * @returns A callable store definition.
 */
export function defineStore<Schema extends StandardSchemaV1>(
  schema: Schema
): StoreDefinition<Schema> {
  if (!isSchema(schema)) {
    throw new Error(
      "Expected a value implementing the Standard Schema V1 protocol."
    );
  }

  const definition = Object.assign(
    (state?: StandardSchemaV1.InferInput<Schema>) =>
      createInstance(schema, state),
    { schema }
  );

  return definition as StoreDefinition<Schema>;
}

/**
 * Builds a single store instance from the definition's schema.
 *
 * With no value the store is seeded from the schema's defaults. With a value,
 * the value is parsed through the schema — which applies defaults for missing
 * fields and rejects non-conforming input — before the store is created.
 */
function createInstance<Schema extends StandardSchemaV1>(
  schema: Schema,
  state?: StandardSchemaV1.InferInput<Schema>
): StoreValueResolver<InferSchema<Schema>> {
  if (state === undefined) {
    return createStore(
      resolveSchema(schema) as InferSchema<Schema>
    ) as StoreValueResolver<InferSchema<Schema>>;
  }

  const result = schema["~standard"].validate(state);

  if (result instanceof Promise) {
    throw new Error(
      "This schema is async — call resolveSchemaAsync(schema) instead"
    );
  }

  if ("issues" in result) {
    throw new Error(
      "The initial value does not conform to the provided schema."
    );
  }

  return createStore(result.value as InferSchema<Schema>) as StoreValueResolver<
    InferSchema<Schema>
  >;
}
