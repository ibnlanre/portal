import { Atom, UseAtom } from "definition";
import { useState, useEffect, SetStateAction } from "react";
import { isSetStateFunction, useShallowEffect } from "utilities";

/**
 * A hook for managing and subscribing to the state of an atom.
 *
 * @template State The type of the atom's state.
 * @template Use The type of the atom's `run` function.
 * @template Dump The return type of the atom's `run` function.
 * @template Data The type of data derived from the atom's state.
 * @template Context The type of context used by the atom.
 *
 * @param {Atom<State, Use, Data, Context>} store The atom to use.
 * @param {((ctx: Context) => void)} singleton An optional singleton function to call before initializing the state of the atom.
 *
 * @returns {[Data, (value: State | SetStateAction<State>) => void]} An array containing the atom's data and a function to set its state.
 */
export function useAtom<
  State,
  Use extends ReadonlyArray<any>,
  Data,
  Context,
  Properties
>(
  store: Atom<State, Use, Data, Context, Properties>,
  ...args: Use
): UseAtom<Data, State, Properties> {
  store.waitlist.add(store);
  const [state, setState] = useState(store.value);
  const { get, set, next, subscribe } = store;

  useShallowEffect(() => store.await(args), args);
  useEffect(() => {
    const subscriber = subscribe(setState);
    return subscriber.unsubscribe;
  }, []);

  const atom = get(state);
  const setAtom = (value: State | SetStateAction<State>) => {
    const isFunction = isSetStateFunction(value);
    const data = isFunction ? value(state) : value;
    next(set(data));
  };

  setAtom.props = store.props;
  return [atom, setAtom];
}
