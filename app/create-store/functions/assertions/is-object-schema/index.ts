import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { GenericObject } from "@/create-store/types/generic-object";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isSchema } from "@/create-store/functions/assertions/is-schema";

/**
 * Checks whether a schema describes an object shape.
 *
 * Detects Zod-style object schemas via the presence of a `shape` property,
 * and falls back to attempting validation with an empty object.
 *
 * @param schema The schema to inspect.
 * @returns A boolean indicating whether the schema produces a dictionary output.
 */
export function isObjectSchema(
  schema: StandardSchemaV1
): schema is StandardSchemaV1<GenericObject> {
  if (!isSchema(schema)) return false;

  const result = schema["~standard"].validate({});
  if (result instanceof Promise) return false;
  return !("issues" in result) && isDictionary(result.value);
}
