import { isDictionary } from "@/create-store/functions/assertions/is-dictionary";
import { isObject } from "@/create-store/functions/assertions/is-object";
import { isValidKey } from "@/create-store/functions/assertions/is-valid-key";

/**
 * Create a deep clone of any value
 * Preserves prototypes for plain objects and handles:
 * - Primitives
 * - Date objects
 * - RegExp objects
 * - Arrays
 * - Plain objects (preserving prototype)
 * - Cyclic references
 * - Other objects (shallow copy)
 *
 * @param value - The value to clone
 * @param visited - WeakMap tracking already processed objects to handle cyclic references
 *
 * @returns A new cloned value
 */
export function createSnapshot<T>(value: T, visited = new WeakMap()): T {
  if (!isObject(value)) return value;

  if (visited.has(value)) return visited.get(value);

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }

  if (Array.isArray(value)) {
    const clone = [] as typeof value;

    visited.set(value, clone);

    value.forEach((item, index) => {
      clone[index] = createSnapshot(item, visited);
    });

    return clone as T;
  }

  if (isDictionary(value)) {
    const result = Object.create(
      Object.getPrototypeOf(value),
      Object.getOwnPropertyDescriptors(value)
    );

    visited.set(value, result);

    for (const key of Reflect.ownKeys(value)) {
      if (!isValidKey(key)) continue;

      const originalValue = Reflect.get(value, key);

      if (!isObject(originalValue)) {
        Reflect.set(result, key, originalValue);
        continue;
      }

      const clone = createSnapshot(originalValue, visited);
      Reflect.set(result, key, clone);
    }

    return result as T;
  }

  return value;
}
