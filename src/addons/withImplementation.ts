import { useState, useEffect } from "react";

import { portal } from "@/subject";
import type {
  PortalState,
  Subscription,
  UsePortalImplementation,
} from "@/definition";

/**
 * Internal function to handle state and subscriptions for the `usePortal` hook.
 *
 * @template State The type of the state.
 * @template Path The type of the path.
 *
 * @returns {PortalState<State>} An array containing the state and the setter function for state updates.
 */
export function usePortalImplementation<
  Path extends string,
  State,
  Store extends Storage
>({
  path,
  initialState,
  options,
}: UsePortalImplementation<Path, State, Store>): PortalState<State> {
  let override = false;

  const [storedState] = useState(() => {
    try {
      if (typeof options?.get !== "undefined") {
        const storedValue = options.get(options.store, path);
        if (storedValue) return (override = true), storedValue;
      }
    } catch (error) {
      console.error("Error retrieving value from storage:", error);
    }
    return initialState;
  });

  /**
   * Retrieve the portal entry associated with the specified key or create a new one if not found.
   * @type {BehaviorSubject<State>}
   */
  const { observable, store } = portal.getItem(path, storedState, override);

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
    let storage: Subscription | undefined;

    /**
     * The same path can be used for multiple stores.
     */
    if (typeof options?.store !== "undefined") {
      store.add(options.store);
    }

    /**
     * If the store is empty, subscribe to state changes and update the storage.
     */
    if (typeof options?.store !== "undefined" && !store.size) {
      /**
       * Add the store to the set of stores.
       */

      /**
       * Subscribe to state changes using the BehaviorSubject and update the storage.
       * @type {Subscription}
       */
      storage = observable.subscribe((value) => {
        options.set(value, options.store, path);
      });
    }

    /**
     * Unsubscribe from state changes when the component is unmounted.
     * @returns {void}
     */
    return () => {
      subscriber.unsubscribe();
      if (storage) storage.unsubscribe();
    };
  }, [observable]);

  /**
   * Return an array containing the current state and the setter function for state updates.
   * @type {PortalState<S, A>}
   */
  return [state, observable.setter];
}
