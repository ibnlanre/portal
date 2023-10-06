import { Atom, UseAtom } from "definition";
import { useState, useEffect, SetStateAction, useMemo, useRef } from "react";
import { isSetStateFunction } from "utilities";

/**
 * A hook for managing and subscribing to the state of an atom.
 *
 * @template State The type of the atom's state.
 * @template Use The type of the atom's `run` function.
 * @template Mop The return type of the atom's `run` function.
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
  Mop extends (() => void) | void,
  Use extends ReadonlyArray<any>,
  Data,
  Context,
  Dependencies,
  Status
>(
  store: Atom<State, Mop, Use, Data, Context, Dependencies, Status>,
  ...args: Use
): UseAtom<Data, State, Status> {
  const isFirst = useRef(true);

  const [state, setState] = useState(store.value());
  const { get, set, next, subscribe } = store;

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (args.length) store.use(...args);
  }, args);

  useEffect(() => {
    const subscriber = subscribe(setState);
    return subscriber.unsubscribe;
  }, []);

  const atom = get(state);
  const setAtom = (value: State | SetStateAction<State>) => {
    const isFunction = isSetStateFunction(value);
    next(set(isFunction ? value(state) : value));
  };

  setAtom.status = store.status;
  return [atom, setAtom];
}
