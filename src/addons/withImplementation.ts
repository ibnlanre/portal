import { useState, useEffect, useMemo } from "react";

import { getComputedState, objectToStringKey } from "utilities";
import { BehaviorSubject, usePortalEntries } from "subject";

import type { Implementation, PortalEntry, PortalState } from "definition";

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
  const { entries, addItemToEntries } = usePortalEntries<S, A>();

  // Check whether the component is wrapped with the portal provider.
  if (!entries) {
    throw new Error("usePortal must be used within a PortalProvider");
  }

  /**
   * Retrieve the portal entry associated with the specified key or create a new one if not found.
   * @type {PortalEntry<S, A>}
   */
  const subject = useMemo<PortalEntry<S, A>>(() => {
    if (!override && entries.has(stringKey)) {
      return entries.get(stringKey) as PortalEntry<S, A>;
    }

    const state =
      initialState instanceof Promise
        ? undefined
        : getComputedState(initialState);

    return {
      observable: new BehaviorSubject(state as S),
      reducer,
    };
  }, [entries]);

  /**
   * Store the current value of the state.
   * @type {S}
   */
  const [state, setState] = useState(subject.observable.value);

  /**
   * Subscribe to state changes and update the component's state accordingly.
   */
  useEffect(() => {
    if (!entries.has(stringKey)) addItemToEntries(stringKey, subject);

    /**
     * Subscribe to state changes using the BehaviorSubject and update the component's state.
     * @type {Subscription}
     */
    const subscriber = subject.observable.subscribe(setState);

    // Set the reducer function for state updates if provided.
    if (reducer) subject.reducer = reducer;

    // Set the options for cookie state.
    if (cookieOptions) subject.cookieOptions = cookieOptions;

    // Check if the `initialState` is a Promise, and if so, resolve it and set the state.
    // Else, change the value of the observable to the `initialState` provided.
    if (typeof initialState !== "undefined") {
      if (initialState instanceof Promise) {
        initialState.then(subject.observable.next);
      } else {
        const state = getComputedState(initialState);
        subject.observable.next(state);
      }
    }

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
