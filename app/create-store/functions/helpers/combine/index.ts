import type { Combine } from "@/create-store/types/combine";
import type { GenericObject } from "@/create-store/types/generic-object";

import { assign } from "@/create-store/functions/helpers/assign";

/**
 * Combines multiple objects into a single object using deep merge.
 * Takes any number of objects as arguments and merges them from left to right.
 *
 * @param objects The objects to combine
 * @returns A new deeply merged object
 */
export function combine<Objects extends GenericObject[]>(
  ...objects: Objects
): Combine<Objects> {
  if (objects.length === 0) return {} as Combine<Objects>;
  if (objects.length === 1) return objects[0] as Combine<Objects>;

  const [first, ...rest] = objects;
  return assign(first, rest) as Combine<Objects>;
}
