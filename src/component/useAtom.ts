import { Atom, Options, UseAtom } from "definition";
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
 * @param {Atom<State, Data, Context, Properties, Use>} store The atom to use.
 * @param {((ctx: Context) => void)} singleton An optional singleton function to call before initializing the state of the atom.
 *
 * @returns {[Data, (value: State | SetStateAction<State>) => void]} An array containing the atom's data and a function to set its state.
 */
export function useAtom<
  State,
  Data,
  Context,
  Properties,
  Use extends ReadonlyArray<any>,
  Select = Data
>(
  store: Atom<State, Data, Context, Properties, Use>,
  options: Options<Select, Data, Use>
): UseAtom<Select, Data, State, Properties> {
  const { get, set, next, subscribe } = store;

  store.waitlist.add(store);
  const [state, setState] = useState(store.value);
  const [props, setProps] = useState(store.props);

  const {
    enabled,
    select = (transform) => transform as unknown as Select,
    args,
  } = options;

  useShallowEffect(() => {
    if (!enabled) return;
    const result = store.await(args);
    return result;
  }, [enabled, ...args]);

  useEffect(() => {
    const subscriber = subscribe({
      state: setState,
      props: setProps,
    });
    return subscriber.unsubscribe;
  }, []);

  const transform = get(state);
  const atom = select(transform);
  const setAtom = (value: State | SetStateAction<State>) => {
    const isFunction = isSetStateFunction(value);
    const data = isFunction ? value(state as State) : value;
    const payload = set(data);
    next(payload);
  };

  setAtom.set = set;
  setAtom.props = props;

  return [atom, setAtom];
}
