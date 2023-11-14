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
export function usePortalImplementation<Path extends string, State>({
  path,
  initialState,
  options,
}: UsePortalImplementation<Path, State>): PortalState<State> {
  let override = false;

  const [storedState] = useState(() => {
    try {
      if (typeof options?.get !== "undefined") {
        const storedValue = options?.get?.(path);
        if (storedValue) return (override = true), storedValue;
      }
    } catch (error) {
      console.error("Error retrieving value from storage:", error);
    }
    return initialState as State;
  });

  /**
   * Retrieve the portal entry associated with the specified key or create a new one if not found.
   * @type {PortalValue<State>}
   */
  const { observable, storage } = portal.getItem(path, storedState, override);

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
   * Subscribe the specified storage to the current value of the state.
   */
  useEffect(() => {
    if (typeof options?.set !== "undefined") {
      let persistence: Subscription;

      if (!storage.has(options.set)) {
        storage.add(options.set);
        persistence = observable.subscribe((value) => {
          options?.set?.(value, path);
        });
      } else return;

      return () => {
        persistence.unsubscribe();
        if (typeof options?.set !== "undefined") {
          storage.delete(options.set);
        }
      };
    }

    return () => void 0;
  }, [storage.size]);

  /**
   * Return an array containing the current state and the setter function for state updates.
   * @type {PortalState<S, A>}
   */
  return [state, observable.setter];
}
