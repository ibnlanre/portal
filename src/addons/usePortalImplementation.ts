import { useState, useEffect } from "react";

import type {
  GetValueByPath,
  Paths,
  PortalOptions,
  PortalState,
  Subscription,
} from "@/definition";
import { Portal } from "@/subject";

/**
 * Represents the properties of the `usePortalImplemenation` hook.
 *
 * @template State The type of the state.
 * @template Path The type of the path.
 * @template Store The type of the store.
 * @template Data The type of the data.
 */
interface UsePortalImplementation<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data
> {
  path: Path;
  portal: Portal;
  initialState?: State;
  options?: PortalOptions<State, Data>;
}

/**
 * Internal function to handle state and subscriptions for the `usePortal` hook.
 *
 * @template Store The store of the portal
 * @template Path The path to the portal's state
 * @template State The state of the portal
 * @template Data The data of the portal
 *
 * @param {UsePortalImplementation<Store, Path, State, Data>} properties
 *
 * @property {Path} path The path of the portal's state
 * @property {Portal} [portal] The portal to be used
 * @property {Config<State>} [config] The config of the portal's state
 * @property {State} initialState The initial state of the portal
 *
 * @returns {PortalState<State>} A tuple containing the current state and a function to update the state.
 */
export function usePortalImplementation<
  Store extends Record<string, any>,
  Path extends Paths<Store>,
  State extends GetValueByPath<Store, Path>,
  Data
>(
  properties: UsePortalImplementation<Store, Path, State, Data>
): PortalState<State, Data> {
  const { path, portal, options, initialState } = properties;
  const {
    set,
    select = (value: State) => value as unknown as Data,
    state = initialState as State,
    get,
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
  const { observable } = portal.getItem(path, resolvedState);

  /**
   * Subscribe to state changes and update the component's state accordingly.
   */
  useEffect(() => {
    let persistence: Subscription | undefined;

    /**
     * Subscribe the component's state to the current value of the portal.
     * @type {Subscription}
     */
    const subscriber = observable.subscribe(setResolvedState);

    /**
     * Get the stored value from the `get` method and update the portal's state.
     */
    const storedValue = get?.(observable.value);
    if (typeof storedValue !== "undefined") {
      observable.set(storedValue);
    }

    /**
     * Subscribe the `set` method to the current value of the portal.
     */
    if (typeof set !== "undefined") {
      persistence = observable.subscribe(set);
    }

    /**
     * Unsubscribe from state changes when the component is unmounted.
     * @returns {void}
     */
    return () => {
      subscriber.unsubscribe();
      persistence?.unsubscribe();
    };
  }, [observable]);

  /**
   * Return an array containing the current state and the setter function for state updates.
   * @type {PortalState<State>}
   */
  return [select(observable.value), observable.set];
}
