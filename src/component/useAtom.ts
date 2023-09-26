import { Atom } from "definition";
import { useState, useEffect, SetStateAction } from "react";
import { isSetStateFunction } from "utilities";

/**
 * Custom hook to access and manage an isolated state within an Atom storage.
 * @template S The type of the state.
 * @template A The type of the actions.
 *
 * @param {Atom<S, A>} store The Atom storage from which to access the state.
 * @returns {PortalState<S, A>} A tuple containing the current state and a function to update the state.
 */
export function useAtom<State, Run, Residue, Data, Context>(
  store: Atom<State, Run, Residue, Data, Context>
) {
  const { get, set, next, subscribe } = store;
  const [state, setState] = useState(store.value);

  useEffect(() => {
    const subscriber = subscribe(setState);
    return subscriber.unsubscribe;
  }, []);

  const atom = get(state);
  const setAtom = (value: State | SetStateAction<State>) => {
    const isFunction = isSetStateFunction(value);
    next(set(isFunction ? value(store.value) : value));
  };
  
  return [atom, setAtom] as const;
}
