import type { Atomic } from "@/create-store/types/atomic";
import type { DeepPartial } from "@/create-store/types/deep-partial";
import type { GenericObject } from "@/create-store/types/generic-object";

import { atomic } from "@/create-store/constants/atomic";

/**
 * Marks an object as atomic by adding a hidden, immutable symbol property.
 *
 * @param value - The object to be marked as atomic.
 * @returns The same object with the atomic symbol property added.
 */
export function createAtom<State extends GenericObject>(
  value: DeepPartial<State>
): Atomic<DeepPartial<State>> {
  if (atomic in value) return value as Atomic<DeepPartial<State>>;

  Object.defineProperty(value, atomic, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  });

  return value as Atomic<DeepPartial<State>>;
}
