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
 * A function type to update properties.
 *
 * @template Properties The type of properties to update.
 */
type Emit<Properties> = (
  props: Partial<Properties> | ((curr: Properties) => Properties)
) => void;

/**
 * Represents a garbage collector for managing functions.
 */
export interface Garbage<T = void | (() => void) | undefined> {
  /**
   * Update the garbage collector with a new function.
   *
   * @param {T} fn The function to update the garbage collector with.
   */
  update(fn?: T): void;

  /**
   * Unmount the garbage collector with a function.
   *
   * @param {T} fn The function to unmount from the garbage collector.
   */
  unmount(fn?: T): void;
}

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template State The type of the state.
 * @template Context The type of the context associated with the Atom.
 * @template Properties The type of properties associated with the Atom.
 */
export type Fields<State, Context, Properties> = {
  value: State;
  set: (value: State) => State;
  next: (value: State) => void;
  previous: () => State | undefined;
  subscribe: (
    observer: (value: State) => any,
    initialize?: boolean
  ) => {
    unsubscribe: () => void;
  };
  redo: () => void;
  undo: () => void;
  history: State[];
  ctx: Context;
  props: Properties;
  emit: Emit<Properties>;
  /**
   * Dispose the Atom or its properties.
   *
   * @param {"update" | "unmount"} bin The type of disposal ("update" or "unmount").
   */
  dispose(bin: "update" | "unmount"): void;
  on: Garbage;
};

/**
 * Represents parameters for various Atom operations.
 *
 * @template State The type of the state.
 * @template Context The type of the context associated with the Atom.
 * @template Properties The type of properties associated with the Atom.
 */
export type Params<State, Context, Properties> = {
  props: Properties;
  previous: State;
  ctx: Context;
  value: State;
};

/**
 * Represents events associated with an Atom.
 *
 * @template State The type of the state.
 * @template Use An array of argument types for the `use` event.
 * @template Data The type of data returned by the `get` event.
 * @template Context The type of the context associated with the Atom.
 * @template Properties The type of properties associated with the Atom.
 */
export interface Events<
  State,
  Use extends ReadonlyArray<any>,
  Data,
  Context,
  Properties
> {
  set?: (params: Params<State, Context, Properties>) => State;
  get?: (params: Params<State, Context, Properties>) => Data;
  use?: (
    fields: Fields<State, Context, Properties>,
    ...args: Use
  ) => (() => void) | void;
}

/**
 * Configuration options for creating an Atom.
 *
 * @template State The type of the state.
 * @template Use An array of argument types for the `use` event.
 * @template Data The type of data returned by the `get` event.
 * @template Context The type of the context associated with the Atom.
 * @template Properties The type of properties associated with the Atom.
 */
export type AtomConfig<
  State,
  Use extends ReadonlyArray<any>,
  Data,
  Context,
  Properties
> = {
  state: State | ((ctx: Context) => State);
  events?: Events<State, Use, Data, Context, Properties>;
  context?: Context;
  properties?: Properties;
};

/**
 * Represents an Atom in the portal system.
 * An Atom is a special type of portal entry that allows you to manage and update state.
 *
 * @template State The type of the state.
 * @template Use An array of argument types for the `use` event.
 * @template Data The type of data returned by the `get` event.
 * @template Context The type of the context associated with the Atom.
 * @template Properties The type of properties associated with the Atom.
 */
export interface Atom<
  State,
  Use extends ReadonlyArray<any>,
  Data,
  Context,
  Properties
> extends Fields<State, Context, Properties> {
  waitlist: Set<Atom<State, Use, Data, Context, Properties>>;
  /**
   * Get the data associated with the Atom.
   *
   * @param {State} value The value to get data for.
   * @returns {Data} The data associated with the Atom.
   */
  get(value?: State): Data;
  /**
   * Execute the `use` event with optional arguments.
   *
   * @param {...Use} args Optional arguments to pass to the `use` event.
   */
  use(...args: Use): void;
  /**
   * Await a specific state by executing the `use` event.
   *
   * @param {Use} args The arguments to pass to the `use` event.
   * @returns {() => void} A function to unmount the awaiting state.
   */
  await(args: Use): () => void;
}

/**
 * Represents a function to set state with properties.
 *
 * @template State The type of the state.
 * @template Properties The type of properties associated with the Atom.
 */
type SetAtom<State, Properties> = {
  (value: State | SetStateAction<State>): void;
  props: Properties;
};

/**
 * Represents the result of using an Atom.
 *
 * @template Data The type of data associated with the Atom.
 * @template State The type of the state.
 * @template Properties The type of properties associated with the Atom.
 */
export type UseAtom<Data, State, Properties> = [
  Data,
  SetAtom<State, Properties>
];

export * from "./cookieOptions";
export * from "./implementation";
