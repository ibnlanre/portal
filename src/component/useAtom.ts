import { useEffect, useState } from "react";
import { Atom } from "./atom";

/**
 * Custom hook to access and manage an isolated state within an Atom storage.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {Atom<S, A>} store The Atom storage from which to access the state.
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 */
export function useAtom<State, Data, Variables>(
  store: Atom<State, Data, Variables>
) {
  const { get, value, set, update, subscribe } = store;
  const [state, setState] = useState(value);

  useEffect(() => {
    const subscriber = subscribe(setState, false);
    return subscriber.unsubscribe;
  }, []);

  const atom = get(state);
  const setAtom = (value: State) => {
    update(set(value));
  };

  return [atom, setAtom] as const;
}
