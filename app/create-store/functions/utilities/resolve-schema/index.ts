import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { InferSchema } from "@/create-store/types/infer-schema";

import { isSchema } from "@/create-store/functions/assertions/is-schema";

/**
 * Runs a single schema validation and returns the synchronous result, throwing
 * when the schema turns out to be async.
 *
 * A Standard Schema is uniformly sync or async — if its `validate` returns a
 * Promise once, it always will. So this guard only needs to inspect the first
 * call; the throw tells the caller they picked the wrong entry point.
 *
 * @param schema The schema to validate against.
 * @param value  The seed value to validate.
 * @returns The synchronous validation result.
 */
function validateSync<Schema extends StandardSchemaV1>(
  schema: Schema,
  value: unknown
): StandardSchemaV1.Result<InferSchema<Schema>> {
  const result = schema["~standard"].validate(value);
  if (result instanceof Promise) {
    throw new Error(
      "This schema is async — call resolveSchemaAsync(schema) instead"
    );
  }
  return result as StandardSchemaV1.Result<InferSchema<Schema>>;
}

/**
 * Derives a synchronous initial state from a Standard Schema by attempting
 * validation with sensible seed inputs.
 *
 * For object schemas the seed is `{}`, allowing field-level `.default()` calls
 * in the schema to fill in the initial values. For scalar schemas the seed is
 * `undefined`, which triggers any top-level default.
 *
 * If neither seed produces a valid result, `undefined` is returned — the store
 * will have no initial state and behaves as a primitive store regardless of the
 * schema's output shape.
 *
 * Async schemas are not supported here — use `resolveSchemaAsync` for schemas
 * whose `validate` returns a Promise.
 *
 * @param schema The schema to parse.
 * @returns The schema's default output, or `undefined` if none can be derived.
 */
export function resolveSchema<Schema extends StandardSchemaV1>(
  schema: Schema
): InferSchema<Schema> | undefined {
  if (!isSchema(schema)) {
    throw new Error(
      "Expected a value implementing the Standard Schema V1 protocol."
    );
  }

  const objectSeed = validateSync(schema, {});
  if (!("issues" in objectSeed)) {
    return objectSeed.value;
  }

  const scalarSeed = validateSync(schema, undefined);
  if ("issues" in scalarSeed) return undefined;
  return scalarSeed.value;
}

/**
 * Derives an initial state from a Standard Schema, handling async schemas
 * whose `validate` returns a Promise.
 *
 * Behaves like `resolveSchema` but awaits schema validation before resolving.
 *
 * @param schema The schema to parse.
 * @returns A Promise of the schema's default output, or `undefined` if none can be derived.
 */
export async function resolveSchemaAsync<Schema extends StandardSchemaV1>(
  schema: Schema
): Promise<InferSchema<Schema> | undefined> {
  if (!isSchema(schema)) {
    throw new Error(
      "Expected a value implementing the Standard Schema V1 protocol."
    );
  }

  const objectSeed = await schema["~standard"].validate({});
  if (!("issues" in objectSeed)) {
    return objectSeed.value;
  }

  const scalarSeed = await schema["~standard"].validate(undefined);
  if ("issues" in scalarSeed) return undefined;
  return scalarSeed.value;
}
