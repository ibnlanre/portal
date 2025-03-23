import type { Dictionary } from "@/create-store/types/dictionary";

/**
 * Check if the value is a dictionary.
 *
 * @param value The value to check.
 *
 * @returns A boolean indicating whether the value is a dictionary.
 */
export function isDictionary(value: unknown): value is Dictionary {
  return Object.prototype.toString.call(value) === "[object Object]";
}
