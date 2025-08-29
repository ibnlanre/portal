import type { AtomicStateSetter } from "@/create-store/types/atomic-state-setter";

/**
 * Represents the return type of the $use hook for primitive stores.
 * Returns a tuple of [currentValue, setter] where the setter performs
 * complete state replacement.
 */
export type AtomicStateManager<State, Value = State> = [
  Value,
  AtomicStateSetter<State>,
];
