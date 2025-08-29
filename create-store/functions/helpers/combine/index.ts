import type { Combine } from "@/create-store/types/combine";
import type { GenericObject } from "@/create-store/types/generic-object";
import type { Replace } from "@/create-store/types/replace";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isPrimitive } from "@/create-store/functions/assertions/is-primitive";
import { clone } from "@/create-store/functions/helpers/clone";

/**
 * A simple and straightforward deep merge function that recursively merges objects.
 * Handles cyclic references to prevent infinite recursion.
 *
 * @param target The target object that will receive the merged values
 * @param sources An array of source objects to merge into the target
 *
 * @returns A new merged object without modifying any of the inputs
 */
export function combine<
  Target extends GenericObject,
  Sources extends GenericObject[],
>(
  target: Target,
  sources: Sources,
  cache?: WeakMap<object, object>
): Combine<Target, Sources>;

/**
 * A simple and straightforward deep merge function that recursively merges objects.
 * Handles cyclic references to prevent infinite recursion.
 *
 * @param target The target object that will receive the merged values
 * @param source The source object to merge into the target
 *
 * @returns A new merged object without modifying any of the inputs
 */
export function combine<
  Target extends GenericObject,
  Source extends GenericObject,
>(
  target: Target,
  source?: Source,
  cache?: WeakMap<object, object>
): Source extends GenericObject ? Replace<Target, Source> : Target;

export function combine<
  Target extends GenericObject,
  Source extends GenericObject | GenericObject[],
>(target: Target, source?: Source, cache = new WeakMap()) {
  if (Array.isArray(source)) {
    let result: any = target;
    for (let index = 0; index < source.length; index++) {
      result = combine(result, source[index], cache);
    }
    return result;
  }

  if (isPrimitive(source) || !isDictionary(source)) {
    return source;
  }

  if (cache.has(target)) return cache.get(target);

  const result = clone(target, cache);
  cache.set(target, result);

  const properties = Object.getOwnPropertyNames(source);
  const symbols = Object.getOwnPropertySymbols(source);

  combineHelper(result, properties, source, cache);
  combineHelper(result, symbols, source, cache);

  return result;
}

/**
 * Copies properties from the source dictionary to the result dictionary.
 * If a property in the result is a non-dictionary, it is replaced with the source value.
 * If it is a dictionary, it is combined with the source value.
 *
 * @param result The target dictionary to copy properties into
 * @param keys The keys to copy from the source dictionary
 * @param source The source dictionary from which to copy properties
 * @param cache A WeakMap to track cache objects for cyclic references
 */
export function combineHelper(
  result: GenericObject,
  keys: Array<PropertyKey>,
  source: GenericObject,
  cache: WeakMap<object, object> = new WeakMap()
): void {
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

    const targetValue = result[key];
    const sourceValue = source[key];

    if (isDictionary(targetValue) && isDictionary(sourceValue)) {
      result[key] = combine(targetValue, sourceValue, cache);
    } else result[key] = sourceValue;
  }
}
