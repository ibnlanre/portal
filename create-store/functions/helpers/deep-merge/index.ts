import type { Dictionary } from "@/create-store/types/dictionary";
import type { Merge } from "@/create-store/types/merge";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isObject } from "@/create-store/functions/assertions/is-object";
import { isValidKey } from "@/create-store/functions/assertions/is-valid-key";
import { createSnapshot } from "@/create-store/functions/helpers/create-snapshot";

/**
 * A simple and straightforward deep merge function that recursively merges objects.
 * Handles cyclic references to prevent infinite recursion.
 *
 * @param target - The target object that will receive the merged values
 * @param source - The source object to merge into the target
 *
 * @returns A new merged object without modifying any of the inputs
 */
export function deepMerge<
  Target extends Dictionary,
  Source = unknown,
  Result = Merge<Target, Source>,
>(target: Target, source: Source, visited = new WeakMap()): Result {
  if (!isDictionary(source)) {
    return createSnapshot(source, visited) as any;
  }

  if (isObject(target) && visited.has(target)) {
    return visited.get(target) as Result;
  }

  const result = createSnapshot(target, visited);

  if (isObject(target)) {
    visited.set(target, result);
  }

  for (const key of Reflect.ownKeys(source)) {
    if (!isValidKey(key)) continue;

    const targetValue = result[key];
    const sourceValue = Reflect.get(source, key);

    if (isObject(sourceValue) && visited.has(sourceValue)) {
      Reflect.set(result, key, visited.get(sourceValue));
      continue;
    }

    if (isDictionary(targetValue)) {
      Reflect.set(result, key, deepMerge(targetValue, sourceValue, visited));
      continue;
    }

    Reflect.set(result, key, createSnapshot(sourceValue, visited));
  }

  return result as any;
}
