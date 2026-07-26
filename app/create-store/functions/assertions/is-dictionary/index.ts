import type { Dictionary } from "@/create-store/types/dictionary";

/**
 * Assert that the value is a dictionary.
 *
 * @param value The value to check.
 * @throws {TypeError} If the value is not a dictionary.
 */
export function assertIsDictionary(
  value: unknown
): asserts value is Dictionary {
  if (typeof value !== "object" || value === null) {
    throw new TypeError("Expected a dictionary object.");
  }
}

/**
 * Check if the value is a dictionary.
 *
 * @param value The value to check.
 * @returns A boolean indicating whether the value is a dictionary.
 */
export function isDictionary(value: unknown): value is Dictionary {
  return Object.prototype.toString.call(value) === "[object Object]";
}
