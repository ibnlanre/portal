import type { Reducer, SetStateAction, Dispatch } from "react";
import type { CookieOptions } from "./cookieOptions";
import type { BehaviorSubject } from "subject";

type Key<K, P extends readonly string[] = []> = {
  get: <Y extends any[]>(...args: Y) => [...P, K, ...Y];
  use: () => [...P, K];
};

export type KeyBuilder<
  T extends Record<string, any>,
  P extends readonly string[] = []
> = {
  [K in keyof T]: T[K] extends (...args: infer R) => any
    ? {
        get: <Y extends any[]>(...args: Y) => [...P, Extract<K, string>, ...Y];
        use: (...args: Parameters<T[K]>) => [...P, Extract<K, string>, ...R];
      }
    : T[K] extends Record<string, any>
    ? Key<K, P> & KeyBuilder<T[K], [...P, Extract<K, string>]>
    : Key<K, P>;
};

export type Builder<
  T extends Record<string, any>,
  P extends readonly string[] = []
> = {
  use: () => T;
} & KeyBuilder<T, P>;

export type NestedObject<
  T extends Record<string, any>,
  P extends string[]
> = P extends [infer First, ...infer Rest]
  ? First extends string
    ? Rest extends string[]
      ? { [K in First]: NestedObject<T, Rest> }
      : never
    : never
  : T;

export type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? K extends "use" | "get"
          ? never
          : `${K}` | `${K}.${Paths<T[K]>}`
        : never;
    }[keyof T]
  : "";

export type ParseAsNumber<Key extends string | number> =
  Key extends `${infer Value extends number}` ? Value : Key;

export type GetValueByPath<
  T,
  Path extends string | number
> = ParseAsNumber<Path> extends keyof T
  ? T[ParseAsNumber<Path>]
  : Path extends `${infer Key}.${infer Rest}`
  ? ParseAsNumber<Key> extends keyof T
    ? GetValueByPath<T[ParseAsNumber<Key>], Rest>
    : never
  : never;

/**
 * Represents a record of the store value and reducer in the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalEntry<S, A> = {
  observable: BehaviorSubject<S>;
  reducer?: Reducer<S, A>;
  cookieOptions?: CookieOptions;
  waitlist?: Set<Initial<S>>;
};

/**
 * Represents a map of keys and values in the portal entries.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalMap<S, A> = Map<string, PortalEntry<S, A>>;

/**
 * Represents a storage type.
 * @typedef {"local" | "session" | "cookie"} StorageType
 */
export type StorageType = "local" | "session" | "cookie";

/**
 * Represents the type of an action that can be dispatched to update the state.
 *
 * @description
 * If the generic type `A` is defined, the action type is `A`, otherwise, it's `SetStateAction<S>`.
 *
 * @template S The type of the state.
 * @template A The type of the action (optional).
 */
export type Action<S, A> = A | SetStateAction<S>;

/**
 * Represents the type of a subscription to a `Subject`.
 */
export type Subscription = {
  /**
   * Unsubscribes the callback from receiving further updates.
   */
  unsubscribe: () => void;
};

/**
 * Type for the dispatcher function based on the action type.
 * If the type `A` (actions) is `undefined`, the value is of type `S`.
 * Otherwise, the value is of type `A`.
 *
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type Dispatcher<S, A> = Dispatch<Action<S, A>>;

/**
 * Represents the portal entries with specialized methods for managing the entries.
 */
export type PortalEntries = {
  /**
   * Map containing a record of each portal value and reducer function
   * @type {Map}
   */
  entries: PortalMap<any, any>;
  /**
   * Function for deleting a key from the portal system.
   * @param {any} key The key to delete.
   * @returns {void}
   */
  remove(key: any, storageTypes?: Array<StorageType>): void;
  /**
   * Function for clearing all entries from the portal system.
   * @returns {void}
   */
  clear(): void;
};

/**
 * Represents the result of the usePortal hook.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalState<S, A = undefined> = [S, Dispatcher<S, A>];

/**
 * Represents the result of the `usePortal` hook.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 */
export type PortalResult<S, A = undefined> = PortalState<S, A> | PortalEntries;

/**
 * Represents the initial value for the portal store.
 * @template S The type of the store value.
 */
export type Initial<S> = S | (() => S) | Promise<S>;

/**
 * Represents the implementation of a portal.
 * @template S The type of the store value.
 * @template A The type of the action for the reducer.
 *
 * @param {any} key The key associated with the portal.
 * @param {Initial<S>} [initialState] The initial state of the portal.
 * @param {Reducer<S, A>} [reducer] The reducer function for the portal.
 *
 * @returns {PortalState<S, A>} A tuple containing the state and a function for updating the state.
 */
export type PortalImplementation<T> = <S extends T, A = undefined>(
  key: any,
  initialState?: Initial<S>,
  reducer?: Reducer<S, A>
) => PortalState<S, A>;

/**
 * A function type to update context.
 *
 * @template Context The type of context to update.
 */
type Emit<Context> = (
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
 * @template Properties The type of the properties associated with the Atom.
 * @template Context The type of context associated with the Atom.
 */
export type Fields<State, Properties, Context> = {
  /**
   * Gets the current value of the Atom instance.
   *
   * @function
   * @returns {State} The current value.
   */
  value: State;
  /**
   * Gets the properties associated with the Atom instance.
   *
   * @function
   * @returns {Properties} The properties.
   */
  props: Properties;
  /**
   * Gets the `context` associated with the Atom instance.
   *
   * @function
   * @returns {Properties} The `context`.
   */
  ctx: Context;
  /**
   * Sets the state with a new value, optionally transforming it using the provided function.
   *
   * @function
   * @param {State} value The new state value or a transformation function.
   * @returns {State} The updated state value after the change.
   */
  set: (value: State) => State;
  /**
   * Updates the state with a new value and notifies subscribers.
   *
   * @function
   * @param {State} value The new state value.
   * @returns {State} The updated state value after the change.
   */
  next: (value: State) => void;
  /**
   * Retrieves the previous state in the history, if available.
   *
   * @function
   * @returns {State | undefined} The previous state in the history, or undefined if not available.
   */
  previous: () => State | undefined;
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
   * Gets the history of state changes.
   *
   * @function
   * @returns {Array<State>} An array containing the history of state changes.
   */
  history: State[];
  /**
   * Sets the context associated with the Atom.
   *
   * @param {Partial<Context> | ((curr: Context) => Context)} ctx The new context or a function to transform the existing context.
   * @returns {Context} The updated context.
   */
  emit: Emit<Context>;
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
 * Represents parameters for various Atom operations.
 *
 * @template State The type of the state.
 * @template Properties The type of the properties associated with the Atom.
 * @template Context The type of context associated with the Atom.
 */
export type Setter<State, Properties, Context> = {
  ctx: Context;
  previous: State;
  props: Properties;
  value: State;
};

/**
 * Represents parameters for various Atom operations.
 *
 * @template State The type of the state.
 * @template Properties The type of the properties associated with the Atom.
 * @template Context The type of context associated with the Atom.
 */
export type Getter<State, Properties, Context> = {
  value: State;
  ctx: Context;
  previous: State;
  props: Properties;
};

/**
 * Represents events associated with an Atom.
 *
 * @template State The type of the state.
 * @template UseArgs An array of argument types for the `use` event.
 * @template Data The type of data returned by the `get` event.
 * @template Properties The type of the properties associated with the Atom.
 * @template Context The type of context associated with the Atom.
 */
export interface Events<
  State,
  Data,
  Properties,
  Context,
  UseArgs extends ReadonlyArray<any>,
  GetArgs extends ReadonlyArray<any>
> {
  set?: (params: Setter<State, Properties, Context>) => State;
  get?: (
    params: Getter<State, Properties, Context>,
    ...getArgs: GetArgs
  ) => Data;
  use?: (
    fields: Fields<State, Properties, Context>,
    ...useArgs: UseArgs
  ) => Garbage;
}

/**
 * Configuration options for creating an Atom.
 *
 * @template State The type of the state.
 * @template Data The type of data returned by the `get` event.
 * @template Properties The type of the properties associated with the Atom.
 * @template Context The type of context associated with the Atom.
 * @template UseArgs An array of argument types for the `use` event.
 * @template GetArgs An array of argument types for the `get` event.
 */
export type AtomConfig<
  State,
  Data = unknown,
  Properties extends {
    [key: string]: any;
  } = {},
  Context extends {
    [key: string]: any;
  } = {},
  UseArgs extends ReadonlyArray<any> = [],
  GetArgs extends ReadonlyArray<any> = []
> = {
  state: State | ((props: Properties) => State);
  events?: Events<State, Data, Properties, Context, UseArgs, GetArgs>;
  properties?: Properties;
  context?: Context;
};

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template State The type of the state.
 * @template UseArgs An array of argument types for the `use` event.
 * @template Data The type of data returned by the `get` event.
 * @template Properties The type of the properties associated with the Atom.
 * @template Context The type of context associated with the Atom.
 */
export interface Atom<
  State,
  Data,
  Properties,
  Context,
  UseArgs extends ReadonlyArray<any>,
  GetArgs extends ReadonlyArray<any>
> extends Fields<State, Properties, Context> {
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
  waitlist: Set<Atom<State, Data, Properties, Context, UseArgs, GetArgs>>;
  /**
   * A function to execute the awaited atom in the `waitlist`.
   *
   * @function
   * @param {UseArgs} useArgs Optional arguments to pass to the `use` event.
   * @returns {() => void} A function to cleanup the atom `use` event upon unmount.
   */
  await(useArgs: UseArgs): () => void;
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

/**
 * Represents configuration options for the `useAtom` hook.
 *
 * @template Select The type of selected data associated with the Atom.
 * @template Data The type of data derived from the atom's state.
 * @template UseArgs The type of the atom's `use` function.
 *
 * @property {boolean} [enabled] A boolean indicating whether the hook is enabled.
 * @property {(data: Data) => Select} [select] A function to select data from the atom's data.
 * @property {UseArgs} useArgs An array of arguments to pass to the atom's `use` function.
 */
export type Options<
  State,
  Data,
  Properties,
  Select,
  Context,
  UseArgs extends ReadonlyArray<any>,
  GetArgs extends ReadonlyArray<any>
> = {
  store: Atom<State, Data, Properties, Context, UseArgs, GetArgs>;
  select?: (data: Data) => Select;
  enabled?: boolean;
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

export * from "./cookieOptions";
export * from "./implementation";
