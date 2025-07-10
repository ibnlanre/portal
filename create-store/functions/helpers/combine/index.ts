import type { Dictionary } from "@/create-store/types/dictionary";
import type { Merge } from "@/create-store/types/merge";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isPrimitive } from "@/create-store/functions/assertions/is-primitive";

import clone from "@ibnlanre/clone";

/**
 * A simple and straightforward deep merge function that recursively merges objects.
 * Handles cyclic references to prevent infinite recursion.
 *
 * @param target - The target object that will receive the merged values
 * @param source - The source object to merge into the target
 *
 * @returns A new merged object without modifying any of the inputs
 */
export function combine<
  Target extends Dictionary,
  Source = unknown,
  Result = Merge<Target, Source>,
>(target: Target, source: Source, visited = new WeakMap()): Result {
  if (isPrimitive(source) || !isDictionary(source)) {
    return source as unknown as Result;
  }

  if (visited.has(target)) return visited.get(target) as Result;
  const result: Dictionary = clone(target, visited);
  visited.set(target, result);

  const properties = Object.getOwnPropertyNames(source);
  const symbols = Object.getOwnPropertySymbols(source);

  copyProperties(result, properties, source, visited);
  copyProperties(result, symbols, source, visited);

  return result as unknown as Result;
}

/**
 * Copies properties from the source dictionary to the result dictionary.
 * If a property in the result is a non-dictionary, it is replaced with the source value.
 * If it is a dictionary, it is combined with the source value.
 *
 * @param result - The target dictionary to copy properties into
 * @param keys - The keys to copy from the source dictionary
 * @param source - The source dictionary from which to copy properties
 * @param visited - A WeakMap to track visited objects for cyclic references
 */
export function copyProperties(
  result: Dictionary,
  keys: (string | symbol)[],
  source: Dictionary,
  visited: WeakMap<object, object>
): void {
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

    const targetValue = result[key];
    const sourceValue = source[key];

    if (isDictionary(targetValue)) {
      result[key] = combine(targetValue, sourceValue, visited);
    } else result[key] = sourceValue;
  }
}
