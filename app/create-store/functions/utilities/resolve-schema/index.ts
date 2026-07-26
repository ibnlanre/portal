import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { InferSchema } from "@/create-store/types/infer-schema";

/**
 * Derives the initial state from a Standard Schema by attempting validation
 * with sensible seed inputs.
 *
 * For object schemas the seed is `{}`, allowing field-level `.default()` calls
 * in the schema to fill in the initial values. For scalar schemas the seed is
 * `undefined`, which triggers any top-level default.
 *
 * If neither seed produces a valid result, `undefined` is returned — the store
 * will have no initial state and behaves as a primitive store regardless of the
 * schema's output shape.
 *
 * If `validate` returns a Promise, the result is propagated so the caller can
 * await the resolved value before constructing the store.
 *
 * @param schema The schema to parse.
 * @returns The schema's default output, a Promise of it, or `undefined` if none can be derived.
 */
export function resolveSchema<Schema extends StandardSchemaV1>(
  schema: Schema
): InferSchema<Schema> | Promise<InferSchema<Schema>> {
  for (const seed of [{}, undefined]) {
    const result = schema["~standard"].validate(seed);

    if (result instanceof Promise) {
      return result.then((resolved) => {
        if (!("issues" in resolved)) return resolved.value;
        if (seed === undefined) return undefined;

        // Object seed failed asynchronously — try the scalar seed as fallback.
        const fallback = schema["~standard"].validate(undefined);
        if (fallback instanceof Promise) {
          return fallback.then((r) => ("issues" in r ? undefined : r.value));
        }
        return "issues" in fallback ? undefined : fallback.value;
      });
    }

    if (!("issues" in result)) return result.value;
  }

  return undefined;
}
