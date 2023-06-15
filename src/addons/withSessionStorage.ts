import { useState, useEffect, type Reducer } from "react";

import { objectToStringKey } from "../utilities";
import { usePortalImplementation } from "./withImplementation";
import type { Initial, PortalState } from "../entries";

/**
 * Custom hook to access and manage state in the portal system with sessionStorage support.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key The key to identify the state in the portal system and sessionStorage.
 * @param {S} [initialState] The initial state value.
 * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
 *
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 * @throws {Error} If used outside of a PortalProvider component.
 */
export function usePortalWithSessionStorage<S, A>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
): PortalState<S, A> {
  const stringKey = objectToStringKey(key);

  const [store] = useState(() => {
    try {
      if (typeof sessionStorage !== "undefined") return sessionStorage;
    } catch (error) {
      console.error("Cannot find sessionStorage", error);
    }
    return undefined;
  });

  const [storedState] = useState(() => {
    try {
      const item = store?.getItem(stringKey);
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.error("Error retrieving state from sessionStorage:", error);
      return initialState;
    }
  });

  const [state, setState] = usePortalImplementation<S, A>(
    stringKey,
    storedState,
    reducer
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(stringKey, JSON.stringify(state));
    } catch (error) {
      console.error("Error storing state in sessionStorage:", error);
    }
  }, [stringKey, state]);

  return [state, setState];
}
