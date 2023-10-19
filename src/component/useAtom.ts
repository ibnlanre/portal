import { Atom, Options, UseAtom } from "definition";
import { useState, useEffect, SetStateAction } from "react";
import { isSetStateFunction, useShallowEffect } from "utilities";

/**
 * A hook for managing and subscribing to the state of an atom.
 *
 * @template State - The type of the atom's state.
 * @template Data - The type of data derived from the atom's state.
 * @template Context - The type of context used by the atom.
 * @template Properties - The type of properties associated with the Atom.
 * @template Dependencies - The type of the atom's `use` function.
 * @template Select - The type of data to be selected from the atom's data.
 *
 * @param {Atom<State, Data, Context, Properties, Dependencies>} store - The atom to use.
 * @param {Options<Select, Data, Dependencies>} options - Configuration options.
 *
 * @returns {[Data, (value: State | SetStateAction<State>) => void]} - An array containing the atom's data and a function to set its state.
 */
export function useAtom<
  State,
  Data,
  Context,
  Properties,
  Dependencies extends ReadonlyArray<any>,
  Seeds extends ReadonlyArray<any>,
  Select = Data
>(
  options: Options<
    State,
    Data,
    Context,
    Select,
    Properties,
    Dependencies,
    Seeds
  >
): UseAtom<Select, State, Properties> {
  const {
    store,
    select = (transform: Data) => transform as unknown as Select,
    seeds = [] as unknown as Seeds,
    deps = [] as unknown as Dependencies,
    enabled = true,
  } = options;
  const { get, set, next, subscribe, emit } = store;

  // Add this store to the waitlist for future updates.
  store.waitlist.add(store);

  const [state, setState] = useState(store.value);
  const [props, setProps] = useState(store.props);

  // Effect to await changes and execute the `use` function.
  useShallowEffect(() => {
    if (!enabled) return;
    const result = store.await(deps);
    return result;
  }, [enabled, ...deps]);

  // Effect to subscribe to state changes.
  useEffect(() => {
    const subscriber = subscribe({
      state: setState,
      props: setProps,
    });
    return subscriber.unsubscribe;
  }, []);

  const transform = get(state, ...seeds);
  const atom = select(transform);

  // Function to set the atom's state.
  const setAtom = (value: State | SetStateAction<State>) => {
    const isFunction = isSetStateFunction(value);
    const data = isFunction ? value(state as State) : value;
    const payload = set(data);
    next(payload);
  };

  setAtom.set = set;
  setAtom.props = props;
  setAtom.emit = emit;

  return [atom, setAtom];
}
