import { useState, useEffect, type Reducer } from "react";
import { usePortalImplementation, UsePortalResult } from "./implementation";

/**
 * Custom hook to access and manage state in the portal system with localStorage support.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {string} key The key to identify the state in the portal system and localStorage.
 * @param {S?} initialState The initial state value.
 * @param {Reducer<S, A>?} reducer The reducer function to handle state updates.
 *
 * @returns {UsePortalResult<S, A>} A tuple containing the current state and a function to update the state.
 * @throws {Error} If used outside of a PortalProvider component.
 */
export function usePortalWithLocalStorage<S, A = undefined>(
  key: string,
  initialState?: S,
  reducer?: Reducer<S, A>
): UsePortalResult<S, A> {
  const [storedState, setStoredState] = useState(initialState);

  useEffect(() => {
    const storedState = localStorage?.getItem(key);
    if (storedState) setStoredState(JSON.parse(storedState));
    else localStorage?.setItem(key, JSON.stringify(initialState));
  }, []);

  return typeof window !== "undefined"
    ? usePortalImplementation(key, storedState, reducer, localStorage)
    : usePortalImplementation(key, initialState, reducer);
}
