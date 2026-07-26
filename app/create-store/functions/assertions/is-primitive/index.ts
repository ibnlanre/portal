import type { Primitives } from "@/create-store/types/primitives";

/**
 * Checks if a value is a primitive type.
 * Primitives include: null, undefined, boolean, number, string, symbol, and bigint.
 *
 * @param value The value to check
 * @returns True if the value is a primitive type, false otherwise
 */
export function isPrimitive(value: unknown): value is Primitives {
  if (value === null || value === undefined) return true;
  return typeof value !== "object" && typeof value !== "function";
}
