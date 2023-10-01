import { Atom } from "definition";
import { useState, useEffect, SetStateAction } from "react";
import { isSetStateFunction } from "utilities";

/**
 * A hook for managing and subscribing to the state of an atom.
 *
 * @template State The type of the atom's state.
 * @template Use The type of the atom's `run` function.
 * @template Used The return type of the atom's `run` function.
 * @template Data The type of data derived from the atom's state.
 * @template Context The type of context used by the atom.
 *
 * @param {Atom<State, Use, Data, Context>} store The atom to use.
 * @param {((ctx: Context) => void)} singleton An optional singleton function to call before initializing the state of the atom.
 *
 * @returns {[Data, (value: State | SetStateAction<State>) => void]} An array containing the atom's data and a function to set its state.
 */
export function useAtom<State, Use, Data, Context>(
  store: Atom<State, Use, Data, Context>,
  singleton?: (ctx: Context) => void
) {
  const { get, set, next, subscribe } = store;
  const [state, setState] = useState(() => {
    if (singleton) singleton(store.ctx);
    return store.value;
  });

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
