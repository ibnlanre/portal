import type { GenericObject } from "@/create-store/types/generic-object";
import type { Replace } from "@/create-store/types/replace";

import { assign } from "@/create-store/functions/helpers/assign";

/**
 * Acts as a selector fallback mechanism.
 * If a selector tries to access a property that doesn't exist,
 * the fallback function provides a default value for that property.
 * This ensures that the selector always returns a valid object,
 * even if some properties are missing.
 *
 * @param outerState - The outer state object to provide fallback values.
 * @returns A function that takes an inner state object and combines it with the outer state.
 */
export function fallback<State extends GenericObject>(outerState: State) {
  return <InnerState extends GenericObject>(
    innerState: InnerState
  ): Replace<State, InnerState> => {
    return assign(outerState, innerState);
  };
}
