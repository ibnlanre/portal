import type { GenericObject } from "@/create-store/types/generic-object";

/**
 * Check if the value is a plain object.
 *
 * @param value The value to check.
 * @returns A boolean indicating whether the value is a plain object.
 */
export function isObject(value: unknown): value is GenericObject {
  return typeof value === "object" && value !== null;
}
