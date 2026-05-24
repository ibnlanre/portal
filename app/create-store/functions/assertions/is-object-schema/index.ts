import type { Dictionary } from "@/create-store/types/dictionary";
import type { StandardSchema } from "@/create-store/types/schema";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";

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
  schema: StandardSchema
): schema is StandardSchema<unknown, Dictionary> {
  if ("shape" in schema && isDictionary((schema as any).shape)) return true;

  const result = schema["~standard"].validate({});
  if (result instanceof Promise) return false;
  return !("issues" in result) && isDictionary(result.value);
}
