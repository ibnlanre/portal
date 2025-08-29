import type { Atomic } from "@/create-store/types/atomic";
import type { GenericObject } from "@/create-store/types/generic-object";

import { atomic } from "@/create-store/constants/atomic";

/**
 * Checks whether an object is marked as atomic.
 * Returns true if the object has the hidden marker property.
 * Safe to call on any value.
 */
export function isAtomic(value: GenericObject): value is Atomic<GenericObject> {
  return Object.is(value[atomic], true);
}
