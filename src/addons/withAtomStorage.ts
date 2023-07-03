import { useEffect } from "react";

import { usePortalImplementation } from "./withImplementation";
import type { PortalState } from "../entries";
import type { Atom } from "../component";

/**
 * Custom hook to access and manage state in the portal system with localStorage support.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {any} key The key to identify the state in the portal system and localStorage.
 * @param {S} [initialState] The initial state value.
 * @param {Reducer<S, A>} [reducer] The reducer function to handle state updates.
 *
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 * @throws {Error} If used outside of a PortalProvider component.
 */
export function usePortalWithAtomStorage<S, A = undefined>(
  store: Atom<S, A>
): PortalState<S, A> {
  const { key, storedState, reducer } = store.destructure();
  const [state, setState] = usePortalImplementation<S, A>(
    key,
    storedState,
    reducer
  );

  useEffect(() => {
    store.setItem(state);
  }, [state]);

  return [state, setState];
}
