import type { GenericObject } from "@/create-store/types/generic-object";
import type { Merge } from "@/create-store/types/merge";

/**
 * Merges two objects into a new object.
 *
 * @param target The target object that will receive the merged values
 * @param source The source object to merge into the target
 *
 * @returns A new merged object without modifying any of the inputs
 */
export function merge<Target extends GenericObject, Source>(
  target: Target,
  source: Source
): Merge<Target, Source> {
  return Object.defineProperties(
    target,
    Object.getOwnPropertyDescriptors(source)
  ) as Merge<Target, Source>;
}
