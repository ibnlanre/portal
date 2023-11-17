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
export function usePortalImplementation<Path extends string, State, Data>({
  path,
  initialState,
  options,
}: UsePortalImplementation<Path, State, Data>): PortalState<State, Data> {
  const {
    set,
    get,
    select = (value: State) => value as unknown as Data,
    state = initialState as State,
    override = true,
    key,
  } = { ...options };

  /**
   * Retrieve the stored state from the specified storage or use the initial state if not found.
   * @type {State}
   */
  const [resolvedState, setResolvedState] = useState(state);

  /**
   * Retrieve the portal entry associated with the specified key or create a new one if not found.
   * @type {PortalValue<State>}
   */
  const { observable, storage } = portal.getItem(path, resolvedState);

  /**
   * Subscribe to state changes and update the component's state accordingly.
   */
  useEffect(() => {
    /**
     * Subscribe to state changes using the BehaviorSubject and update the component's state.
     * @type {Subscription}
     */
    const subscriber = observable.subscribe(setResolvedState);

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
    if (typeof set !== "undefined") {
      let persistence: Subscription;

      if (!storage.has(set)) {
        storage.add(set);
        const observer = (value: State) => set(value, path);
        persistence = observable.subscribe(observer);
      } else return;

      return () => {
        persistence.unsubscribe();
        storage.delete(set);
      };
    }

    return () => void 0;
  }, [storage.size]);

  useEffect(() => {
    const storedValue = get?.(path);
    if (typeof storedValue !== "undefined") {
      if (override) observable.setter(storedValue);
    }
  }, [key]);

  const data = select(resolvedState);

  /**
   * Return an array containing the current state and the setter function for state updates.
   * @type {PortalState<S, A>}
   */
  return [data, observable.setter];
}
