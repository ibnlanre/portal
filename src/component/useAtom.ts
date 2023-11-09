import { useState, useEffect, SetStateAction } from "react";

import { Options, UseAtom } from "@/definition";
import { isSetStateFunction, useDebouncedShallowEffect } from "@/utilities";

/**
 * A hook for managing and subscribing to the state of an atom.
 *
 * @template State - The type of the atom's state.
 * @template Data - The type of data derived from the atom's state.
 * @template Properties - The type of properties used by the atom.
 * @template Context - The type of context associated with the Atom.
 * @template UseArgs - The type of the atom's `use` function.
 * @template Select - The type of data to be selected from the atom's data.
 *
 * @param {Atom<State, Data, Properties, Context, UseArgs>} store - The atom to use.
 * @param {Options<Select, Data, UseArgs>} options - Configuration options.
 *
 * @returns {[Data, (value: State | SetStateAction<State>) => void]} - An array containing the atom's data and a function to set its state.
 */
export function useAtom<
  State,
  Data,
  Properties,
  Context,
  UseArgs extends ReadonlyArray<any>,
  GetArgs extends ReadonlyArray<any>,
  Select = Data
>(
  options: Options<State, Data, Properties, Select, Context, UseArgs, GetArgs>
): UseAtom<Select, State, Context> {
  const {
    store,
    select = (transform: Data) => transform as unknown as Select,
    getArgs = [] as unknown as GetArgs,
    useArgs = [] as unknown as UseArgs,
    enabled = true,
  } = options;
  const { get, set, subscribe, provide, emit } = store;

  // Add this store to the waitlist for future updates.
  store.waitlist.add(store);

  const [state, setState] = useState(store.current);
  const [ctx, setProps] = useState(store.ctx);

  // Effect to await changes and execute the `use` function.
  useDebouncedShallowEffect(() => {
    if (!enabled) return;
    return store.await(useArgs);
  }, [enabled, ...useArgs]);

  useEffect(() => {
    // Effect to subscribe to context changes.
    const provider = provide(setProps);

    // Effect to subscribe to state changes.
    const subscriber = subscribe(setState);

    return () => {
      subscriber.unsubscribe();
      provider.unsubscribe();
    };
  }, []);

  const transform = get(state, ...getArgs);
  const atom = select(transform);
  
  // Function to set the atom's state.
  const setAtom = (value: State | SetStateAction<State>) => {
    const isFunction = isSetStateFunction(value);
    const data = isFunction ? value(state as State) : value;
    set(data);
  };

  setAtom.update = setAtom;
  setAtom.state = state;
  setAtom.emit = emit;
  setAtom.ctx = ctx;

  return [atom, setAtom];
}
