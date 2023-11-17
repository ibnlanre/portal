import { useState, useEffect, SetStateAction } from "react";

import { getComputedState, useDebouncedShallowEffect } from "@/utilities";
import type { AtomOptions, UseAtom } from "@/definition";

/**
 * A hook for managing and subscribing to the state of an atom.
 *
 * @template State - The type of the atom's state.
 * @template Data - The type of data derived from the atom's state.
 * @template Properties - The type of properties used by the atom.
 * @template Context - The type of context associated with the Atom.
 * @template UseArgs - The type of the atom's `use` function.
 * @template GetArgs - The type of the atom's `get` function.
 * @template Select - The type of data to be selected from the atom's data.
 *
 * @param {AtomOptions<State, Data, Properties, Context, UseArgs, GetArgs, Select>} options - Configuration options.
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
  options: AtomOptions<
    State,
    Data,
    Properties,
    Context,
    UseArgs,
    GetArgs,
    Select
  >
): UseAtom<Select, State, Context> {
  const {
    store,
    select = (data: Data) => data as unknown as Select,
    getArgs = [] as unknown as GetArgs,
    useArgs = [] as unknown as UseArgs,
  } = options;
  const { get, set, subscribe, provide, emit, delay } = store;

  // Add this store to the waitlist for future updates.
  store.waitlist.add(store);

  const [state, setState] = useState(store.value);
  const [ctx, setProps] = useState(store.ctx);

  // Effect to await changes and execute the `use` function.
  useDebouncedShallowEffect(() => store.await(useArgs), useArgs, delay);
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
    set(getComputedState(value, state));
  };

  setAtom.update = setAtom;
  setAtom.state = state;
  setAtom.emit = emit;
  setAtom.ctx = ctx;

  return [atom, setAtom];
}
