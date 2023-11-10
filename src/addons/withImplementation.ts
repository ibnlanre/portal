import { useState, useEffect } from "react";

import { portal } from "@/subject";
import type { PortalState } from "@/definition";

/**
 * Internal function to handle state and subscriptions for the `usePortal` hook.
 *
 * @template State The type of the state.
 * @template Path The type of the path.
 *
 * @returns {PortalState<State>} An array containing the state and the setter function for state updates.
 */
export function usePortalImplementation<Path extends string, State>(
  path: Path,
  initialState: State,
  override: boolean = false
): PortalState<State> {
  /**
   * Retrieve the portal entry associated with the specified key or create a new one if not found.
   * @type {BehaviorSubject<State>}
   */
  const observable = portal.getItem(path, initialState, override);

  /**
   * Store the current value of the state.
   * @type {State}
   */
  const [state, setState] = useState(observable.value);

  /**
   * Subscribe to state changes and update the component's state accordingly.
   */
  useEffect(() => {
    /**
     * Subscribe to state changes using the BehaviorSubject and update the component's state.
     * @type {Subscription}
     */
    const subscriber = observable.subscribe(setState);

    /**
     * Unsubscribe from state changes when the component is unmounted.
     * @returns {void}
     */
    return subscriber.unsubscribe;
  }, [observable]);

  /**
   * Return an array containing the current state and the setter function for state updates.
   * @type {PortalState<S, A>}
   */
  return [state, observable.setter];
}
