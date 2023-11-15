import { useState, useEffect } from "react";

import { portal } from "@/subject";
import type {
  PortalState,
  Subscription,
  UsePortalImplementation,
} from "@/definition";
import { isFunction } from "@/utilities";

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
  let overridePortalState = false;
  const {
    set,
    get,
    select = (value: State) => value as unknown as Data,
    override = true,
  } = { ...options };

  const isGetterFunction = isFunction(get);

  /**
   * Retrieve the stored state from the specified storage or use the initial state if not found.
   * @type {State}
   */
  const [storedState, setStoredState] = useState(() => {
    if (typeof get !== "undefined" && !isGetterFunction) {
      overridePortalState = override;
      return get as State;
    }
    return initialState as State;
  });

  useEffect(() => {
    try {
      if (isGetterFunction) {
        const storedValue = get(path);
        if (typeof storedValue !== "undefined") {
          overridePortalState = override;
          setStoredState(storedValue);
        }
      }
    } catch (error) {
      console.error("Error retrieving value:", error);
    }
  }, []);

  /**
   * Retrieve the portal entry associated with the specified key or create a new one if not found.
   * @type {PortalValue<State>}
   */
  const { observable, storage } = portal.getItem(
    path,
    storedState,
    overridePortalState
  );

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
    if (typeof set !== "undefined") {
      let persistence: Subscription;

      if (!storage.has(set)) {
        storage.add(set);
        persistence = observable.subscribe((value) => set(value, path));
      } else return;

      return () => {
        persistence.unsubscribe();
        storage.delete(set);
      };
    }

    return () => void 0;
  }, [storage.size]);

  const value = select(state);

  /**
   * Return an array containing the current state and the setter function for state updates.
   * @type {PortalState<S, A>}
   */
  return [value, observable.setter];
}
