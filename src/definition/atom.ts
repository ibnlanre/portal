import type { SetStateAction } from "react";

/**
 * A function type to update context.
 *
 * @template Context The type of context to update.
 */
export type Emit<Context> = (
  ctx: Partial<Context> | ((curr: Context) => Context)
) => void;

/**
 * Represents a garbage collector for managing functions.
 */
export interface Collector<T = void | (() => void) | undefined> {
  /**
   * Adds a cleanup function to be executed when the Atom is updated.
   *
   * @function
   * @param {() => void} fn The cleanup function to add.
   */
  rerun(fn?: T): void;

  /**
   * Adds a cleanup function to be executed when the Atom is unmounted.
   *
   * @function
   * @param {() => void} fn The cleanup function to add.
   */
  unmount(fn?: T): void;
}

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template State The type of the state.
 * @template Context The type of context associated with the Atom.
 */
export type Fields<State, Context> = {
  /**
   * Gets the timeline of state changes.
   *
   * @function
   * @returns {Array<State>} An array containing the timeline of state changes.
   */
  timeline: State[];
  /**
   * Gets the current value of the Atom instance.
   *
   * @function
   * @returns {State} The current value.
   */
  value: State;
  /**
   * Retrieves the previous state in the timeline, if available.
   *
   * @function
   * @returns {State | undefined} The previous state in the timeline, or undefined if not available.
   */
  rewind: State | undefined;
  /**
   * Retrieves the next state in the timeline, if available.
   *
   * @function
   * @returns {State | undefined} The next state in the timeline, or undefined if not available.
   */
  forward: State | undefined;
  /**
   * Subscribes to changes in the Atom's value.
   *
   * @function
   * @param {Function} observer The callback function to be called with the new value.
   * @returns {Object} An object with an `unsubscribe` function to stop the subscription.
   */
  subscribe: (
    observer: (value: State) => any,
    initialize?: boolean
  ) => {
    unsubscribe: () => void;
  };
  /**
   * Sets the state with a new value.
   *
   * @function
   * @param {State} value The new state value.
   */
  update: (value: State) => void;
  /**
   * Sets the state with a new value, optionally transforming it using the provided function.
   *
   * @function
   * @param {State} value The new state value.
   */
  set: (value: State) => void;
  /**
   * Sets the context associated with the Atom.
   *
   * @param {Partial<Context> | ((curr: Context) => Context)} ctx The new context or a function to transform the existing context.
   * @returns {Context} The updated context.
   */
  emit: Emit<Context>;
  /**
   * Subscribes to changes in the Atom's value.
   *
   * @function
   * @param {Function} observer The callback function to be called with the new value.
   * @returns {Object} An object with an `unsubscribe` function to stop the subscription.
   */
  provide: (
    observer: (value: Context) => any,
    initialize?: boolean
  ) => {
    unsubscribe: () => void;
  };
  /**
   * Gets the `context` associated with the Atom instance.
   *
   * @function
   * @returns {Context} The `context`.
   */
  ctx: Context;
  /**
   * Redoes a previous state change.
   *
   * @function
   */
  redo: () => void;
  /**
   * Undoes a previous state change.
   *
   * @function
   */
  undo: () => void;
  /**
   * Provides control over functions to execute on specific Atom events.
   *
   * @typedef {Object} Collector
   * @property {Function} rerun A function to add a cleanup function to be executed when the Atom is updated.
   * @property {Function} unmount A function to add a cleanup function to be executed when the Atom is unmounted.
   */
  on: Collector;
  /**
   * Disposes of the set of functions resulting from the last execution of the `use` function.
   *
   * @param {"rerun" | "unmount"} bin The type of disposal ("rerun" or "unmount").
   */
  dispose(bin: "rerun" | "unmount"): void;
};

type Garbage =
  | { rerun?: () => void; unmount?: () => void }
  | (() => void)
  | void;

/**
 * Represents parameters used by the `set` method.
 *
 * @template State The type of the state.
 * @template Context The type of context associated with the Atom.
 */
export type Setter<State, Context> = {
  value: State;
  previous: State;
  ctx: Context;
  emit: Emit<Context>;
};

/**
 * Defines the parameters used by the `get` method.
 *
 * @template State The type of the state.
 * @template Context The type of context associated with the Atom.
 */
export type Getter<State, Context> = {
  value: State;
  previous: State;
  ctx: Context;
  emit: Emit<Context>;
};

/**
 * Represents events associated with an Atom.
 *
 * @template State The type of the state.
 * @template Context The type of context associated with the Atom.
 * @template Data The type of data returned by the `get` event.
 * @template UseArgs An array of argument types for the `use` event.
 * @template GetArgs An array of argument types for the `get` event.
 */
export interface AtomEvents<
  State,
  Data,
  Context,
  UseArgs extends ReadonlyArray<any>,
  GetArgs extends ReadonlyArray<any>
> {
  set?: (params: Setter<State, Context>) => State;
  get?: (params: Getter<State, Context>, ...getArgs: GetArgs) => Data;
  use?: (fields: Fields<State, Context>, ...useArgs: UseArgs) => Garbage;
}

/**
 * Represents the state of an Atom.
 *
 * @template State The type of the state.
 * @template Context The type of context associated with the Atom.
 */
export type AtomState<State, Context> = State | ((context: Context) => State);

/**
 * Configuration options for creating an Atom.
 *
 * @template State The type of the state.
 * @template Data The type of data returned by the `get` event.
 * @template Context The type of context associated with the Atom.
 * @template UseArgs An array of argument types for the `use` event.
 * @template GetArgs An array of argument types for the `get` event.
 */
export type AtomConfig<
  State,
  Data = unknown,
  Context extends {
    [key: string]: any;
  } = {},
  UseArgs extends ReadonlyArray<any> = [],
  GetArgs extends ReadonlyArray<any> = []
> = {
  state: AtomState<State, Context>;
  events?: AtomEvents<State, Data, Context, UseArgs, GetArgs>;
  context?: Context;
  delay?: number;
};

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template State The type of the state.
 * @template UseArgs An array of argument types for the `use` event.
 * @template Data The type of data returned by the `get` event.
 * @template Context The type of context associated with the Atom.
 */
export interface Atom<
  State,
  Data,
  Context,
  UseArgs extends ReadonlyArray<any>,
  GetArgs extends ReadonlyArray<any>
> extends Fields<State, Context> {
  /**
   * Execute the `use` event with optional arguments.
   *
   * @function
   * @param {...UseArgs} useArgs Optional arguments to pass to the `use` event.
   * @returns {void}
   */
  use(...useArgs: UseArgs): void;
  /**
   * Retrieves the current state or optionally transforms it using the provided function.
   *
   * @function
   * @param {State} value The current state value or a transformation function.
   * @returns {Data} The transformed value, which could be of a different data type.
   */
  get(value?: State, ...getArgs: GetArgs): Data;
  /**
   * A set containing functions to execute when awaiting state changes.
   * @type {Set<() => void>}
   */
  waitlist: Set<Atom<State, Data, Context, UseArgs, GetArgs>>;
  /**
   * A function to execute the awaited atom in the `waitlist`.
   *
   * @function
   * @param {UseArgs} useArgs Optional arguments to pass to the `use` event.
   * @returns {() => void} A function to cleanup the atom `use` event upon unmount.
   */
  await(useArgs: UseArgs): () => void;
  /**
   * The number of milliseconds to delay before updating the Atom's state.
   */
  delay: number;
}

/**
 * Represents a function to set state with context.
 *
 * @template State The type of the state.
 * @template Context The type of context associated with the Atom.
 */
type SetAtom<State, Context> = {
  (value: State | SetStateAction<State>): void;
  update(value: State | SetStateAction<State>): void;
  ctx: Context;
  emit: Emit<Context>;
  state: State;
};

type Variables<Args extends ReadonlyArray<any>> = { [K in Args[number]]: K };

/**
 * Represents configuration options for the `useAtom` hook.
 *
 * @template State The type of the atom's state.
 * @template Data The type of data derived from the atom's state.
 * @template Context The type of context associated with the Atom.
 * @template UseArgs The type of the atom's` function.
 * @template GetArgs The type of the atom's `get` function.
 * @template Select The type of selected data associated with the Atom.
 *
 * @property {Atom<State, Data, Context, UseArgs, GetArgs>} store The atom to use.
 * @property {(data: Data) => Select} [select] A function to select data from the atom's data.
 * @property {UseArgs} [useArgs] An array of arguments to pass to the atom's `use` function.
 * @property {GetArgs} [getArgs] An array of arguments to pass to the atom's `get` function.
 */
export type AtomOptions<
  State,
  Data,
  Context,
  UseArgs extends ReadonlyArray<any>,
  GetArgs extends ReadonlyArray<any>,
  Select
> = {
  store: Atom<State, Data, Context, UseArgs, GetArgs>;
  select?: (data: Data) => Select;
  useArgs?: UseArgs;
  getArgs?: GetArgs;
};

/**
 * Represents the result of using an Atom.
 *
 * @template Select The type of selected data associated with the Atom.
 * @template State The type of the state.
 * @template Context The type of context associated with the Atom.
 */
export type UseAtom<Select, State, Context> = [Select, SetAtom<State, Context>];
