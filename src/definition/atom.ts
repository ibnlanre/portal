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
 * Represents a time travel object.
 *
 * @template State The type of the state.
 * @typedef {Object} History
 */
type History<State> = {
  /**
   * Gets the timeline of state changes.
   *
   * @type {Array<State>} An array containing the timeline of state changes.
   */
  timeline: State[];
  /**
   * Retrieves the previous state in the timeline, if available.
   *
   * @type {State | undefined} The previous state in the timeline, or undefined if not available.
   */
  rewind: State | undefined;
  /**
   * Retrieves the next state in the timeline, if available.
   *
   * @type {State | undefined} The next state in the timeline, or undefined if not available.
   */
  forward: State | undefined;
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
};

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template State The type of the state.
 * @template Context The type of context associated with the Atom.
 */
export type Fields<State, Context> = {
  /**
   * Gets the current state of the Atom instance.
   *
   * @function
   * @returns {State} The current state.
   */
  value: State;
  /**
   * Travel to a specific state in the timeline.
   *
   * @typedef {Object} History
   * @property {Array<State>} timeline An array containing the timeline of state changes.
   * @property {Function} rewind A function to access the previous value of the Atom.
   * @property {Function} forward A function to update the value of the Atom instance.
   * @property {Function} redo A function to redo a previous state change.
   * @property {Function} undo A function to undo a previous state change.
   */
  history: History<State>;
  /**
   * Sets the state with a new value, optionally transforming it using the provided `set` function.
   *
   * @function
   * @param {State | ((prevState: State) => State)} value The new state value.
   */
  set: (value: SetStateAction<State>) => void;
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
   * Sets the context associated with the Atom.
   *
   * @param {Partial<Context> | ((curr: Context) => Context)} ctx The new context or a function to transform the existing context.
   * @returns {Context} The updated context.
   */
  emit: Emit<Context>;
  /**
   * Gets the `context` associated with the Atom instance.
   *
   * @function
   * @returns {Context} The `context`.
   */
  ctx: Context;
  /**
   * Disposes of the set of functions resulting from the last execution of the `use` function.
   *
   * @param {"rerun" | "unmount"} bin The type of disposal ("rerun" or "unmount").
   */
  dispose: (bin: "rerun" | "unmount") => void;
  /**
   * Provides control over functions to execute on specific Atom events.
   *
   * @typedef {Object} Collector
   * @property {Function} rerun A function to add a cleanup function to be executed when the Atom is updated.
   * @property {Function} unmount A function to add a cleanup function to be executed when the Atom is unmounted.
   */
  on: Collector;
};

/**
 * Represents a garbage collector for managing functions.
 *
 * @description
 * The `rerun` function adds a cleanup function to be executed when the Atom is updated.
 * The `unmount` function adds a cleanup function to be executed when the Atom is unmounted.
 *
 * @typedef {Function} () => void
 * The cleanup function to be executed on unmount.
 */
type Garbage =
  | { rerun?: () => void; unmount?: () => void }
  | (() => void)
  | void;

/**
 * Defines the parameters used by the `get` and `set` method.
 *
 * @template State The type of the state.
 * @template Context The type of context associated with the Atom.
 */
export type Params<State, Context> = {
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
 *
 * @property {Function} [set] A middleware to call before setting the state.
 * @property {Function} [get] A middleware to call before getting the state.
 * @property {Function} [use] An effect to execute based on the dependencies.
 */
export interface AtomEvents<
  State,
  Data,
  Context,
  UseArgs extends ReadonlyArray<any>,
  GetArgs extends ReadonlyArray<any>
> {
  /**
   * A middleware to call before setting the state.
   *
   * @param params The parameters used by the `set` method.
   * @returns {State} The new state.
   */
  set?: (params: Params<State, Context>) => State;
  /**
   * A middleware to call before getting the state.
   *
   * @param params The parameters used by the `get` method.
   * @returns {Data} The transformed value, which could be of a different data type.
   */
  get?: (params: Params<State, Context>, ...getArgs: GetArgs) => Data;
  /**
   * An effect to execute based on the dependencies.
   *
   * @param fields The fields associated with the Atom.
   * @param useArgs An array of arguments to pass to the `use` function.
   * @returns {Garbage} A garbage collector for cleaning up effects.
   */
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
 *
 * @property {AtomState<State, Context>} state The initial state or a function to generate the initial state.
 * @property {boolean} [debug] A boolean indicating whether to log the state history for debugging.
 * @property {AtomEvents<State, Data, Context, UseArgs, GetArgs>} [events] An object containing functions to interact with the Atom.
 * @property {Context} [context] Record of mutable context on the atom instance.
 * @property {number} [delay] Debounce delay in milliseconds before executing the `use` function.
 *
 */
export type AtomConfig<
  State,
  Data = State,
  Context extends {
    [key: string]: any;
  } = {},
  UseArgs extends ReadonlyArray<any> = [],
  GetArgs extends ReadonlyArray<any> = []
> = {
  /**
   * The initial state or a function to generate the initial state.
   */
  state: AtomState<State, Context>;
  /**
   * A boolean indicating whether to log the state history for debugging.
   */
  debug?: boolean;
  /**
   * An object containing functions to interact with the Atom.
   */
  events?: AtomEvents<State, Data, Context, UseArgs, GetArgs>;
  /**
   * Record of mutable context on the atom instance.
   */
  context?: Context;
  /**
   * Delay in milliseconds to wait before executing the `use` function.
   */
  delay?: number;
};

/**
 * Represents configuration options for an Atom.
 *
 * @template State The type of the atom's state.
 * @template Data The type of data derived from the atom's state.
 * @template Context The type of context associated with the Atom.
 * @template UseArgs The type of the atom's` function.
 * @template GetArgs The type of the atom's `get` function.
 * @template Select The type of selected data associated with the Atom.
 *
 * @property {boolean} [enabled] A boolean indicating whether the `use` function should be executed.
 * @property {(data: Data) => Select} [select] A function to select data from the atom's data.
 * @property {UseArgs} [useArgs] An array of arguments to pass to the atom's `use` function.
 * @property {GetArgs} [getArgs] An array of arguments to pass to the atom's `get` function.
 */
export type AtomOptions<
  State,
  UseArgs extends ReadonlyArray<any>,
  GetArgs extends ReadonlyArray<any>,
  Data = State,
  Select = Data
> = {
  /**
   * A boolean indicating whether the `use` function should be executed.
   */
  enabled?: boolean;
  /**
   * A function to select data from the atom's data.
   * @param data The data returned by the atom's `get` function.
   * @returns {Select} The selected data.
   */
  select?: (data: Data) => Select;
  /**
   * An array of arguments to pass to the atom's `use` function.
   *
   * @type {UseArgs}
   * @memberof AtomOptions
   */
  useArgs?: UseArgs;
  /**
   * An array of arguments to pass to the atom's `get` function.
   *
   * @type {GetArgs}
   * @memberof AtomOptions
   */
  getArgs?: GetArgs;
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
  Context,
  UseArgs extends ReadonlyArray<any>,
  GetArgs extends ReadonlyArray<any>,
  Data = State
> extends Fields<State, Context> {
  /**
   * Retrieves the current state or optionally transforms it using the provided function.
   *
   * @function
   * @param {State} value The current state value or a transformation function.
   * @returns {Data} The transformed value, which could be of a different data type.
   */
  get(value?: State, ...getArgs: GetArgs): Data;
  /**
   * Represents the result of using an Atom.
   *
   * @template Select The type of selected data associated with the Atom.
   * @template State The type of the state.
   * @template Context The type of context associated with the Atom.
   */
  use<Select = Data>(
    options?: AtomOptions<State, UseArgs, GetArgs, Data, Select>
  ): [Select, SetAtom<State, Context>];
}

/**
 * Represents a function to set the state of an Atom.
 *
 * @template State The type of the state.
 * @template Context The type of context associated with the Atom.
 *
 * @typedef {Function} SetAtom
 */
export type SetAtom<State, Context> = {
  /**
   * Sets the state with a new value.
   * @param {State | ((prevState: State) => State)} value The new state value.
   * @returns {void}
   */
  (value: SetStateAction<State>): void;
  /**
   * Sets the state with a new value.
   * @param {State | ((prevState: State) => State)} value The new state value.
   * @returns {void}
   */
  set(value: SetStateAction<State>): void;
  /**
   * The current state of the Atom instance.
   * @type {State} value The new state value.
   */
  state: State;
  /**
   * Sets the context associated with the Atom.
   *
   * @type {Partial<Context> | ((curr: Context) => Context)}
   * @memberof Fields<State, Context>
   */
  emit: Emit<Context>;
  /**
   * Gets the `context` associated with the Atom instance.
   *
   * @type {Context}
   * @memberof Fields<State, Context>
   */
  ctx: Context;
};
