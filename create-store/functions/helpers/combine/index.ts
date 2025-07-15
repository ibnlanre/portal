import type { Combine } from "@/create-store/types/combine";
import type { Dictionary } from "@/create-store/types/dictionary";
import type { Replace } from "@/create-store/types/replace";

import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isPrimitive } from "@/create-store/functions/assertions/is-primitive";
import { clone } from "@/create-store/functions/helpers/clone";

/**
 * A simple and straightforward deep merge function that recursively merges objects.
 * Handles cyclic references to prevent infinite recursion.
 *
 * @param target The target object that will receive the merged values
 * @param source The source object to merge into the target
 *
 * @returns A new merged object without modifying any of the inputs
 */
export function combine<Target extends Dictionary, Source extends Dictionary>(
  target: Target,
  source?: Source,
  visited?: WeakMap<object, object>
): Source extends Dictionary ? Replace<Target, Source> : Target;

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
  Target extends Dictionary,
  Sources extends Dictionary[],
>(
  target: Target,
  sources: Sources,
  visited?: WeakMap<object, object>
): Combine<Target, Sources>;

export function combine<
  Target extends Dictionary,
  Source extends Dictionary | Dictionary[],
>(target: Target, source?: Source, visited = new WeakMap()) {
  // if (!source && isDictionary(target)) return target;

  if (Array.isArray(source)) {
    let result: any = target;
    for (let index = 0; index < source.length; index++) {
      result = combine(result, source[index], visited);
    }
    return result;
  }

  if (isPrimitive(source) || !isDictionary(source)) {
    return source;
  }

  if (visited.has(target)) return visited.get(target);

  const result = clone(target, visited);
  visited.set(target, result);

  const properties = Object.getOwnPropertyNames(source);
  const symbols = Object.getOwnPropertySymbols(source);

  copyProperties(result, properties, source, visited);
  copyProperties(result, symbols, source, visited);

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
 * @param visited A WeakMap to track visited objects for cyclic references
 */
export function copyProperties(
  result: Dictionary,
  keys: Array<PropertyKey>,
  source: Dictionary,
  visited: WeakMap<object, object>
): void {
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

    const targetValue = result[key];
    const sourceValue = source[key];

    if (isDictionary(targetValue) && isDictionary(sourceValue)) {
      result[key] = combine(targetValue, sourceValue, visited);
    } else result[key] = sourceValue;
  }
}
