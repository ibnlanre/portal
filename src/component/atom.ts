import { useEffect, useState } from "react";
import type { SetStateAction } from "react";

import {
  Atom,
  AtomConfig,
  Fields,
  Collector,
  Params,
  AtomOptions,
  SetAtom,
} from "@/definition";
import { AtomSubject } from "@/subject";
import { useDebouncedShallowEffect } from "@/addons";
import { getComputedState, isAtomStateFunction, isFunction } from "@/utilities";

/**
 * @description Creates an Atom instance for managing and updating state.
 * ---
 * @template State The type of the state.
 * @template Data The type of data returned by the `get` event.
 * @template Context The type of context associated with the Atom.
 * @template UseArgs An array of argument types for the `use` event.
 * @template GetArgs An array of argument types for the `get` event.
 * ---
 * @typedef {Object} AtomConfig
 * @param {AtomConfig} config Configuration object for the Atom.
 * @param {State | ((context: Context) => State)} config.state Initial state or a function to generate the initial state.
 * @param {Context} [config.context] Record of mutable context on the atom instance.
 * @param {number} [config.delay] Debounce delay in milliseconds before executing the `use` function.
 * ---
 * @typedef {Object} AtomEvents
 * @param {AtomEvents} [config.events] events object containing functions to interact with the Atom.
 * @param {(params: Setter<State, Context>) => State} [config.events.set] Function to set the Atom's state.
 * @param {(params: Getter<State, Context>) => Data} [config.events.get] Function to get data from the Atom's state.
 * @param {(fields: Fields<State, Context>, ...useArgs: UseArgs) => Collector} [config.events.use] Function to perform asynchronous events.
 * ---
 * @typedef {Object} Atom
 * @returns {Atom<State, Data, Context, UseArgs, GetArgs>} An object containing Atom context and functions.
 */
export function atom<
  State,
  Data = State,
  Context extends {
    [key: string]: any;
  } = {},
  UseArgs extends ReadonlyArray<any> = [],
  GetArgs extends ReadonlyArray<any> = []
>(
  config: AtomConfig<State, Data, Context, UseArgs, GetArgs>
): Atom<State, Context, UseArgs, GetArgs, Data> {
  const {
    state,
    debounce = {},
    context = {} as Context,
    debug = false,
    events,
  } = config;
  const { set, get, use } = { ...events };

  const initialState = isAtomStateFunction(state) ? state(context) : state;

  const observable = new AtomSubject(initialState, debug);
  const signal = new AtomSubject(context);

  const { forward, rewind, redo, undo, update, subscribe } = observable;

  /**
   * A set containing functions to execute when awaiting state changes.
   * @type {WeeakMap<DependencyList, (useArgs: UseArgs) => void> | null}
   */
  const queue = new Map<string, boolean>();

  const collector = {
    rerun: new Set<() => void>(),
    unmount: new Set<() => void>(),
  };

  /**
   * Represents the functions used to collect and dispose of functions.
   *
   * @typedef {Object}
   * @property {Function} rerun A method that adds a cleanup function to the rerun collector.
   * @property {Function} unmount A method that adds a cleanup function to the unmount collector.
   */
  const on: Collector = {
    rerun: (fn?: () => void) => {
      if (typeof fn === "function") {
        collector.rerun.add(fn);
      }
    },
    unmount: (fn?: () => void) => {
      if (typeof fn === "function") {
        collector.unmount.add(fn);
      }
    },
  };

  /**
   * Sets the context of the Atom instance.
   * @param {Partial<Context> | ((curr: Context) => Context)} ctx The context to set.
   * @returns {Context} The updated context.
   */
  const emit = (ctx: Partial<Context> | ((curr: Context) => Context)) => {
    const curr = signal.value;
    if (typeof ctx === "function") signal.update({ ...ctx(curr) });
    else signal.update({ ...curr, ...ctx });
    return signal.value;
  };

  /**
   * Executes a cleanup function and catches any errors.
   * @param {() => void} cleanup The function to execute.
   * @returns {void}
   */
  const trash = (cleanup: () => void) => {
    try {
      cleanup();
    } catch (err) {
      console.error("Error occured during cleanup", err);
    }
  };

  /**
   * Disposes of the set of functions resulting from the last execution of the `use` function.
   *
   * @param {"rerun" | "unmount"} bin The type of disposal ("rerun" or "unmount").
   */
  const dispose = (bin: "rerun" | "unmount") => {
    collector[bin].forEach(trash);
    collector[bin].clear();
  };

  /**
   * Subscribes to changes in the Atom context's value.
   *
   * @function
   * @param {Function} observer The callback function to be called with the new value.
   * @returns {Object} An object with an `unsubscribe` function to stop the subscription.
   */
  const provide = signal.subscribe;

  const setValueWithArgs = (value: SetStateAction<State>) => {
    const resolvedValue = getComputedState(value, observable.value);
    const params: Params<State, Context> = {
      value: resolvedValue,
      previous: observable.value,
      ctx: signal.value,
      emit,
    };

    // The set function allows optional transformations and returns the new state.
    if (set) update(set(params));
    else update(resolvedValue);
  };

  /**
   * Represents the core fields and context of an Atom instance.
   *
   * @typedef {Object} Fields
   *
   * @property {State} value The current state of the Atom instance.
   * @property {History<State>} history An object containing functions to travel through the Atom's timeline.
   *
   * @property {Function} set A function to set the value of the Atom instance with optional transformations.
   * @property {Function} subscribe A function to subscribe to changes in the Atom's value.
   * @property {Function} update A function to update the value of the Atom instance.
   *
   * @property {Function} emit Sets the context of the Atom instance.
   * @property {Context} ctx The context associated with the Atom instance.
   *
   * @property {Function} dispose Disposes of the functions in the collector.
   * @property {Function} on Provides control over functions to execute on specific Atom events.
   */
  const fields: Fields<State, Context> = {
    get value() {
      return observable.value;
    },
    history: {
      get timeline() {
        return observable.timeline;
      },
      get forward() {
        return forward();
      },
      get rewind() {
        return rewind();
      },
      redo,
      undo,
    },
    set: setValueWithArgs,
    subscribe,
    update,
    emit,
    get ctx() {
      return signal.value;
    },
    dispose,
    on,
  };

  /**
   * Executes the `use` function and collects the resulting functions.
   *
   * @function
   * @param {UseArgs} useArgs Optional arguments to pass to the `use` event.
   * @returns {void}
   */
  const useValueWithArgs = (...useArgs: UseArgs) => {
    const value = use?.(fields, ...useArgs);
    if (isFunction(value)) on.unmount(value);
    else {
      on.rerun(value?.rerun);
      on.unmount(value?.unmount);
    }
  };

  const getValueWithArgs = (
    value: State = observable.value,
    ...getArgs: GetArgs
  ) => {
    const params: Params<State, Context> = {
      value,
      previous: observable.value,
      ctx: signal.value,
      emit,
    };

    // The get function allows optional transformations and returns the transformed value.
    if (get) return get(params, ...getArgs);
    else return value as unknown as Data;
  };

  let marker = 0;
  const UUID = Math.random().toString(36).slice(2);

  /**
   * A function to execute the `use` function in the `queue`.
   *
   * @function
   * @param {UseArgs} useArgs Optional arguments to pass to the `use` event.
   * @param {boolean} enabled Whether or not to execute the `use` function.
   * @returns {() => void} A function to cleanup the atom `use` event upon unmount.
   */
  const executeQueue = (useArgs: UseArgs, enabled: boolean) => {
    if (!enabled) return;
    if (!queue.get(JSON.stringify(useArgs))) return;

    console.log(UUID, {
      args: JSON.stringify(useArgs),
      marker,
    });

    dispose("rerun");
    useValueWithArgs(...useArgs);
    queue.set(JSON.stringify(useArgs), false);
  };

  /**
   * A hook to use the Atom instance.
   *
   * @template Select The type of data returned by the `use` event.
   *
   * @function
   * @param {AtomOptions} options Optional options to customize the Atom hook.
   * @param {Function} options.select A function to select data from the Atom's state.
   * @param {GetArgs} options.getArgs Optional arguments to pass to the `get` event.
   * @param {UseArgs} options.useArgs Optional arguments to pass to the `use` event.
   * @param {boolean} options.enabled Whether or not to execute the `use` function.
   *
   * @returns {[Select, SetAtom<State, Context>]} An array containing the selected data and a function to set the Atom's state.
   */
  const useAtom = <Select = Data>(
    options?: AtomOptions<State, UseArgs, GetArgs, Data, Select>
  ): [Select, SetAtom<State, Context>] => {
    const { set, subscribe, emit } = fields;
    const {
      select = (data: Data) => data as unknown as Select,
      getArgs = [] as unknown as GetArgs,
      useArgs = [] as unknown as UseArgs,
      enabled = true,
    } = { ...options };

    const [state, setState] = useState(fields.value);
    const [ctx, setProps] = useState(fields.ctx);

    const key = JSON.stringify(useArgs);
    if (!queue.has(key)) queue.set(key, true);

    // Effect to await changes and execute the `use` function.
    useDebouncedShallowEffect(
      () => executeQueue(useArgs, enabled),
      [enabled, ...useArgs],
      debounce
    );

    useEffect(() => {
      // Effect to subscribe to state changes.
      const subscriber = subscribe(setState);

      // Effect to subscribe to context changes.
      const provider = provide(setProps);

      return () => {
        subscriber.unsubscribe();
        provider.unsubscribe();
        dispose("unmount");
      };
    }, []);

    const transform = getValueWithArgs(state, ...getArgs);
    const atom = select(transform);

    // Function to set the atom's state.
    const dispatch = (value: SetStateAction<State>) => {
      const resolvedValue = getComputedState(value, state);
      set(resolvedValue);
    };

    dispatch.set = dispatch;
    dispatch.state = state;
    dispatch.emit = emit;
    dispatch.ctx = ctx;

    return [atom, dispatch];
  };

  /**
   * Represents the context and functions associated with an Atom instance.
   *
   * @typedef {Object} AtomInstance
   * @property {Function} get A function to get the Atom's state.
   * @property {Function} use A hook to use the Atom instance.
   */
  return {
    ...fields,
    get: getValueWithArgs,
    use: useAtom,
  };
}
