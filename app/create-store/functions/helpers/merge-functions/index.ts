import type { Dictionary } from "@/create-store/types/dictionary";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isFunction } from "@/create-store/functions/assertions/is-function";

/**
 * Merges function-typed properties from a source value onto a target value,
 * recursively.
 *
 * Used to re-attach methods/helpers to a schema-validated state — the schema
 * only describes data, so functions that the schema does not declare are
 * re-applied afterwards. Handles circular references.
 *
 * @param target The value to attach functions onto (usually the validated state).
 * @param source The value to copy functions from (usually the original state).
 * @param cache  Tracks visited target objects to avoid infinite recursion.
 * @returns The target with functions merged onto it.
 */
export function mergeFunctions<Target, Source>(
  target: Target,
  source: Source,
  cache = new WeakSet<object>()
): Target {
  if (!isDictionary(target) || !isDictionary(source)) return target;
  if (cache.has(target)) return target;
  cache.add(target);

  const output: Dictionary = target;

  for (const key in source) {
    const property = source[key];
    if (isFunction(property)) {
      output[key] = property;
    } else if (isDictionary(property)) {
      mergeFunctions(output[key], property, cache);
    }
  }
  return target;
}
