import type { StandardSchema } from "@/create-store/types/schema";

/**
 * Derives the initial state from a Standard Schema by attempting validation
 * with sensible seed inputs.
 *
 * For object schemas the seed is `{}`, allowing field-level `.default()` calls
 * in the schema to fill in the initial values. For scalar schemas the seed is
 * `undefined`, which triggers any top-level default.
 *
 * Async `validate` calls are ignored — `createStore` is synchronous.
 *
 * @param schema The schema to parse.
 * @returns The schema's default output, or `undefined` if none can be derived.
 */
export function resolveSchema<State>(
  schema: StandardSchema<unknown, State>
): State | undefined {
  const objectResult = schema["~standard"].validate({});

  if (!(objectResult instanceof Promise) && !("issues" in objectResult)) {
    return objectResult.value;
  }

  const primitiveResult = schema["~standard"].validate(undefined);

  if (!(primitiveResult instanceof Promise) && !("issues" in primitiveResult)) {
    return primitiveResult.value;
  }

  return undefined as unknown as State;
}
