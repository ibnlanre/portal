import { useState, useEffect, useMemo } from "react";

import { objectToStringKey } from "utilities";
import { portal } from "subject";

import type { Implementation, PortalState } from "definition";

/**
 * Internal function to handle state and subscriptions for the `usePortal` hook.
 *
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {Implementation<S, A>} options The options object containing configuration properties for the hook.
 * @param {any} options.key The key of the portal entry.
 * @param {Initial<S>} [options.initialState] The initial state value.
 * @param {boolean} [options.override=false] If `true`, override an existing portal entry with the same key.
 * @param {Reducer<S, A>} [options.reducer] The reducer function to handle state updates.
 *
 * @returns {PortalState<S, A>} An array containing the state and the setter function for state updates.
 */
export function usePortalImplementation<S, A>({
  key,
  initialState,
  reducer,
  override = false,
  cookieOptions,
}: Implementation<S, A>): PortalState<S, A> {
  const stringKey = objectToStringKey(key);

  /**
   * Retrieve the portal entry associated with the specified key or create a new one if not found.
   * @type {PortalEntry<S, A>}
   */
  const subject = portal.getItem(stringKey, override);

  /**
   * Store the current value of the state.
   * @type {S}
   */
  const [state, setState] = useState(subject.observable.value);
  subject.waitlist?.add(initialState);

  /**
   * Subscribe to state changes and update the component's state accordingly.
   */
  useEffect(() => {
    /**
     * Subscribe to state changes using the BehaviorSubject and update the component's state.
     * @type {Subscription}
     */
    const subscriber = subject.observable.subscribe(setState);
    portal.await(subject, reducer, cookieOptions);

    /**
     * Unsubscribe from state changes when the component is unmounted.
     * @returns {void}
     */
    return subscriber.unsubscribe;
  }, [subject]);

  /**
   * Create the setter function to update the state using the reducer if available.
   * @type {SetterFunction<S, A>}
   */
  const setter = useMemo(() => {
    return subject.observable.watch(subject.reducer);
  }, [subject]);

  /**
   * Return an array containing the current state and the setter function for state updates.
   * @type {PortalState<S, A>}
   */
  return [state, setter];
}
